package com.comandadigital.service;

import com.comandadigital.dto.request.CompraRequest;
import com.comandadigital.dto.request.ItemCompraRequest;
import com.comandadigital.dto.response.CompraResponse;
import com.comandadigital.entity.*;
import com.comandadigital.enums.StatusCompra;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.CompraMapper;
import com.comandadigital.repository.CompraRepository;
import com.comandadigital.repository.HistoricoPrecoRepository;
import com.comandadigital.repository.InsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository repository;
    private final CompraMapper mapper;
    private final FornecedorService fornecedorService;
    private final InsumoService insumoService;
    private final EstoqueService estoqueService;
    private final FichaTecnicaService fichaTecnicaService;
    private final InsumoRepository insumoRepository;
    private final HistoricoPrecoRepository historicoPrecoRepository;

    @Transactional(readOnly = true)
    public Page<CompraResponse> listar(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CompraResponse buscarPorId(Long id) {
        Compra compra = findById(id);
        return mapper.toResponse(compra);
    }

    /**
     * Cria pedido de compra como RASCUNHO (sem impacto no estoque).
     */
    @Transactional
    public CompraResponse criar(CompraRequest request) {
        Fornecedor fornecedor = fornecedorService.findActiveById(request.getFornecedorId());

        Compra compra = Compra.builder()
                .fornecedor(fornecedor)
                .dataCompra(request.getDataCompra())
                .notaFiscal(request.getNotaFiscal())
                .itens(new ArrayList<>())
                .valorTotal(BigDecimal.ZERO)
                .status(StatusCompra.RASCUNHO)
                .build();

        BigDecimal valorTotal = BigDecimal.ZERO;
        List<ItemCompra> itens = new ArrayList<>();

        for (ItemCompraRequest itemReq : request.getItens()) {
            Insumo insumo = insumoService.findActiveById(itemReq.getInsumoId());

            BigDecimal subtotal = itemReq.getQuantidade()
                    .multiply(itemReq.getPrecoUnitario())
                    .setScale(2, RoundingMode.HALF_UP);

            ItemCompra item = ItemCompra.builder()
                    .compra(compra)
                    .insumo(insumo)
                    .quantidade(itemReq.getQuantidade())
                    .precoUnitario(itemReq.getPrecoUnitario())
                    .subtotal(subtotal)
                    .build();

            itens.add(item);
            valorTotal = valorTotal.add(subtotal);
        }

        compra.setItens(itens);
        compra.setValorTotal(valorTotal);
        compra = repository.save(compra);

        return mapper.toResponse(compra);
    }

    @Transactional
    public CompraResponse atualizar(Long id, CompraRequest request) {
        Compra compra = findById(id);

        if (compra.getStatus() == StatusCompra.RECEBIDO) {
            throw new BusinessException("Compra ja recebida nao pode ser alterada");
        }

        Fornecedor fornecedor = fornecedorService.findActiveById(request.getFornecedorId());
        compra.setFornecedor(fornecedor);
        compra.setDataCompra(request.getDataCompra());
        compra.setNotaFiscal(request.getNotaFiscal());

        compra = repository.save(compra);
        return mapper.toResponse(compra);
    }

    /**
     * Altera status do pedido de compra.
     * RASCUNHO -> ENVIADO -> RECEBIDO
     * Ao receber (RECEBIDO): atualiza estoque, custo medio e historico de precos.
     */
    @Transactional
    public CompraResponse alterarStatus(Long id, StatusCompra novoStatus) {
        Compra compra = findById(id);
        StatusCompra statusAtual = compra.getStatus();

        validarTransicaoStatusCompra(statusAtual, novoStatus);

        if (novoStatus == StatusCompra.RECEBIDO) {
            processarRecebimento(compra);
        }

        compra.setStatus(novoStatus);
        compra = repository.save(compra);
        return mapper.toResponse(compra);
    }

    private void processarRecebimento(Compra compra) {
        for (ItemCompra item : compra.getItens()) {
            Insumo insumo = item.getInsumo();

            // Atualizar custo medio ponderado
            atualizarCustoMedio(insumo, item.getQuantidade(), item.getPrecoUnitario());

            // Registrar entrada no estoque
            estoqueService.registrarEntrada(
                    insumo,
                    item.getQuantidade(),
                    "Recebimento - Compra #" + compra.getId() +
                    " NF: " + (compra.getNotaFiscal() != null ? compra.getNotaFiscal() : "S/N")
            );

            // Registrar historico de preco
            HistoricoPreco historico = HistoricoPreco.builder()
                    .insumo(insumo)
                    .fornecedor(compra.getFornecedor())
                    .preco(item.getPrecoUnitario())
                    .dataRegistro(compra.getDataCompra() != null ? compra.getDataCompra() : LocalDate.now())
                    .build();
            historicoPrecoRepository.save(historico);

            // Recalcular fichas tecnicas que usam este insumo
            fichaTecnicaService.recalcularFichasComInsumo(insumo.getId());
        }
    }

    private void validarTransicaoStatusCompra(StatusCompra atual, StatusCompra novo) {
        boolean valido = switch (atual) {
            case RASCUNHO -> novo == StatusCompra.ENVIADO || novo == StatusCompra.CANCELADO;
            case ENVIADO -> novo == StatusCompra.RECEBIDO || novo == StatusCompra.CANCELADO;
            case RECEBIDO, CANCELADO -> false;
        };

        if (!valido) {
            throw new BusinessException("Transicao de status invalida: " + atual + " -> " + novo);
        }
    }

    @Transactional
    public void desativar(Long id) {
        Compra compra = findById(id);
        if (compra.getStatus() == StatusCompra.RECEBIDO) {
            throw new BusinessException("Compra ja recebida nao pode ser cancelada");
        }
        compra.setStatus(StatusCompra.CANCELADO);
        repository.save(compra);
    }

    private void atualizarCustoMedio(Insumo insumo, BigDecimal qtdCompra, BigDecimal precoUnitario) {
        BigDecimal custoAtual = insumo.getCustoMedio() != null ? insumo.getCustoMedio() : BigDecimal.ZERO;
        BigDecimal estoqueAtual = insumo.getQuantidadeEstoque();

        BigDecimal valorEstoqueAtual = estoqueAtual.multiply(custoAtual);
        BigDecimal valorCompra = qtdCompra.multiply(precoUnitario);
        BigDecimal estoqueTotal = estoqueAtual.add(qtdCompra);

        if (estoqueTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal novoCustoMedio = valorEstoqueAtual.add(valorCompra)
                    .divide(estoqueTotal, 2, RoundingMode.HALF_UP);
            insumo.setCustoMedio(novoCustoMedio);
            insumoRepository.save(insumo);
        }
    }

    public Compra findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra nao encontrada: " + id));
    }
}
