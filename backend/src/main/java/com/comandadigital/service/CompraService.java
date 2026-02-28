package com.comandadigital.service;

import com.comandadigital.dto.request.CompraRequest;
import com.comandadigital.dto.request.ItemCompraRequest;
import com.comandadigital.dto.response.CompraResponse;
import com.comandadigital.entity.*;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.CompraMapper;
import com.comandadigital.repository.CompraRepository;
import com.comandadigital.repository.InsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    @Transactional(readOnly = true)
    public Page<CompraResponse> listar(Pageable pageable) {
        return repository.findByStatus(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CompraResponse buscarPorId(Long id) {
        Compra compra = findActiveById(id);
        return mapper.toResponse(compra);
    }

    /**
     * Registra compra com:
     * - Entrada no estoque de cada insumo
     * - Atualizacao do custo medio ponderado
     * - Recalculo automatico das fichas tecnicas e food cost
     */
    @Transactional
    public CompraResponse registrar(CompraRequest request) {
        Fornecedor fornecedor = fornecedorService.findActiveById(request.getFornecedorId());

        Compra compra = Compra.builder()
                .fornecedor(fornecedor)
                .dataCompra(request.getDataCompra())
                .notaFiscal(request.getNotaFiscal())
                .itens(new ArrayList<>())
                .valorTotal(BigDecimal.ZERO)
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

            // Atualizar custo medio ponderado do insumo
            atualizarCustoMedio(insumo, itemReq.getQuantidade(), itemReq.getPrecoUnitario());

            // Registrar entrada no estoque
            estoqueService.registrarEntrada(
                    insumo,
                    itemReq.getQuantidade(),
                    "Compra - NF: " + (request.getNotaFiscal() != null ? request.getNotaFiscal() : "S/N")
            );

            // Recalcular fichas tecnicas que usam este insumo
            fichaTecnicaService.recalcularFichasComInsumo(insumo.getId());
        }

        compra.setItens(itens);
        compra.setValorTotal(valorTotal);
        compra = repository.save(compra);

        return mapper.toResponse(compra);
    }

    @Transactional
    public void desativar(Long id) {
        Compra compra = findActiveById(id);
        compra.setStatus(StatusGeral.INATIVO);
        repository.save(compra);
    }

    /**
     * Custo medio ponderado:
     * novoCusto = ((estoqueAtual * custoMedioAtual) + (qtdCompra * precoUnitario)) / (estoqueAtual + qtdCompra)
     */
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

    public Compra findActiveById(Long id) {
        return repository.findById(id)
                .filter(c -> c.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Compra nao encontrada: " + id));
    }
}
