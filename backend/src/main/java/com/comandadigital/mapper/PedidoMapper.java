package com.comandadigital.mapper;

import com.comandadigital.dto.response.ItemPedidoResponse;
import com.comandadigital.dto.response.PedidoResponse;
import com.comandadigital.entity.ItemPedido;
import com.comandadigital.entity.Pedido;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PedidoMapper {

    public PedidoResponse toResponse(Pedido entity) {
        return PedidoResponse.builder()
                .id(entity.getId())
                .clienteId(entity.getCliente().getId())
                .clienteNome(entity.getCliente().getNome())
                .statusPedido(entity.getStatusPedido())
                .total(entity.getTotal())
                .observacao(entity.getObservacao())
                .itens(entity.getItens().stream()
                        .map(this::toItemResponse)
                        .collect(Collectors.toList()))
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public ItemPedidoResponse toItemResponse(ItemPedido item) {
        return ItemPedidoResponse.builder()
                .id(item.getId())
                .pratoId(item.getPrato().getId())
                .pratoNome(item.getPrato().getNome())
                .quantidade(item.getQuantidade())
                .precoUnitario(item.getPrecoUnitario())
                .subtotal(item.getSubtotal())
                .observacao(item.getObservacao())
                .build();
    }
}
