package com.comandadigital.service;

import com.comandadigital.dto.request.ItemPedidoRequest;
import com.comandadigital.dto.request.PedidoRequest;
import com.comandadigital.dto.response.PedidoResponse;
import com.comandadigital.entity.*;
import com.comandadigital.enums.Perfil;
import com.comandadigital.enums.StatusPedido;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.PedidoMapper;
import com.comandadigital.repository.FichaTecnicaRepository;
import com.comandadigital.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository repository;
    private final PedidoMapper mapper;
    private final PratoService pratoService;
    private final InsumoService insumoService;
    private final EstoqueService estoqueService;
    private final FichaTecnicaRepository fichaTecnicaRepository;

    @Transactional(readOnly = true)
    public Page<PedidoResponse> listar(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> listarPorCliente(Long clienteId, Pageable pageable) {
        return repository.findByClienteId(clienteId, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> listarPorStatus(StatusPedido status, Pageable pageable) {
        return repository.findByStatusPedido(status, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPorId(Long id) {
        Pedido pedido = findById(id);
        return mapper.toResponse(pedido);
    }

    @Transactional
    public PedidoResponse criar(PedidoRequest request, Usuario cliente) {
        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .observacao(request.getObservacao())
                .itens(new ArrayList<>())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<ItemPedido> itens = new ArrayList<>();

        for (ItemPedidoRequest itemReq : request.getItens()) {
            Prato prato = pratoService.findActiveById(itemReq.getPratoId());

            if (!prato.temFichaTecnica()) {
                throw new BusinessException("Prato '" + prato.getNome() + "' nao possui ficha tecnica e nao pode ser pedido");
            }

            FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(prato.getId())
                    .orElseThrow(() -> new BusinessException("Ficha tecnica nao encontrada para o prato: " + prato.getNome()));

            for (ItemFichaTecnica itemFicha : ficha.getItens()) {
                BigDecimal qtdNecessaria = itemFicha.getQuantidadeBruta()
                        .multiply(new BigDecimal(itemReq.getQuantidade()));
                if (!estoqueService.verificarDisponibilidade(itemFicha.getInsumo(), qtdNecessaria)) {
                    throw new BusinessException(
                            "Estoque insuficiente do insumo '" + itemFicha.getInsumo().getNome() +
                            "' para o prato '" + prato.getNome() + "'"
                    );
                }
            }

            BigDecimal subtotal = prato.getPrecoVenda().multiply(new BigDecimal(itemReq.getQuantidade()));

            ItemPedido item = ItemPedido.builder()
                    .pedido(pedido)
                    .prato(prato)
                    .quantidade(itemReq.getQuantidade())
                    .precoUnitario(prato.getPrecoVenda())
                    .subtotal(subtotal)
                    .observacao(itemReq.getObservacao())
                    .build();

            itens.add(item);
            total = total.add(subtotal);
        }

        pedido.setItens(itens);
        pedido.setTotal(total);
        pedido = repository.save(pedido);

        return mapper.toResponse(pedido);
    }

    /**
     * Altera status do pedido com regras de negocio:
     * - PENDENTE -> EM_PREPARO: realiza baixa automatica do estoque
     * - Cancelamento antes de EM_PREPARO: qualquer perfil pode cancelar
     * - Cancelamento apos EM_PREPARO: somente GERENTE ou ADMIN
     * - Cancelamento apos baixa de estoque: realiza estorno
     * - Motivo obrigatorio para cancelamento
     */
    @Transactional
    public PedidoResponse alterarStatus(Long id, StatusPedido novoStatus, Usuario usuarioLogado, String motivoCancelamento) {
        Pedido pedido = findById(id);
        StatusPedido statusAtual = pedido.getStatusPedido();

        validarTransicaoStatus(statusAtual, novoStatus);

        if (novoStatus == StatusPedido.CANCELADO) {
            if (motivoCancelamento == null || motivoCancelamento.isBlank()) {
                throw new BusinessException("Motivo de cancelamento e obrigatorio");
            }

            // Apos EM_PREPARO, so GERENTE ou ADMIN pode cancelar
            if (statusAtual != StatusPedido.PENDENTE) {
                if (usuarioLogado.getPerfil() != Perfil.ADMIN && usuarioLogado.getPerfil() != Perfil.GERENTE) {
                    throw new BusinessException("Apenas ADMIN e GERENTE podem cancelar pedidos apos inicio do preparo");
                }
            }

            pedido.setMotivoCancelamento(motivoCancelamento);

            // Se ja houve baixa de estoque (EM_PREPARO ou PRONTO), realizar estorno
            if (statusAtual == StatusPedido.EM_PREPARO || statusAtual == StatusPedido.PRONTO) {
                realizarEstornoEstoque(pedido);
            }
        }

        // Baixa automatica de estoque ao mudar para EM_PREPARO
        if (novoStatus == StatusPedido.EM_PREPARO) {
            realizarBaixaEstoque(pedido);
        }

        pedido.setStatusPedido(novoStatus);
        pedido = repository.save(pedido);
        return mapper.toResponse(pedido);
    }

    private void realizarBaixaEstoque(Pedido pedido) {
        for (ItemPedido itemPedido : pedido.getItens()) {
            FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(itemPedido.getPrato().getId())
                    .orElseThrow(() -> new BusinessException(
                            "Ficha tecnica nao encontrada para o prato: " + itemPedido.getPrato().getNome()));

            for (ItemFichaTecnica itemFicha : ficha.getItens()) {
                BigDecimal qtdBaixa = itemFicha.getQuantidadeBruta()
                        .multiply(new BigDecimal(itemPedido.getQuantidade()));
                estoqueService.registrarSaida(
                        itemFicha.getInsumo(),
                        qtdBaixa,
                        "Baixa automatica - Pedido #" + pedido.getId()
                );
            }
        }
    }

    private void realizarEstornoEstoque(Pedido pedido) {
        for (ItemPedido itemPedido : pedido.getItens()) {
            FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(itemPedido.getPrato().getId())
                    .orElse(null);
            if (ficha == null) continue;

            for (ItemFichaTecnica itemFicha : ficha.getItens()) {
                BigDecimal qtdEstorno = itemFicha.getQuantidadeBruta()
                        .multiply(new BigDecimal(itemPedido.getQuantidade()));
                estoqueService.registrarEstorno(
                        itemFicha.getInsumo(),
                        qtdEstorno,
                        "Estorno - Cancelamento Pedido #" + pedido.getId()
                );
            }
        }
    }

    private void validarTransicaoStatus(StatusPedido atual, StatusPedido novo) {
        boolean valido = switch (atual) {
            case PENDENTE -> novo == StatusPedido.EM_PREPARO || novo == StatusPedido.CANCELADO;
            case EM_PREPARO -> novo == StatusPedido.PRONTO || novo == StatusPedido.CANCELADO;
            case PRONTO -> novo == StatusPedido.ENTREGUE;
            case ENTREGUE, CANCELADO -> false;
        };

        if (!valido) {
            throw new BusinessException(
                    "Transicao de status invalida: " + atual + " -> " + novo
            );
        }
    }

    public Pedido findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido nao encontrado: " + id));
    }
}
