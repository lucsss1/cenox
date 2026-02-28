package com.comandadigital.mapper;

import com.comandadigital.dto.response.CompraResponse;
import com.comandadigital.dto.response.ItemCompraResponse;
import com.comandadigital.entity.Compra;
import com.comandadigital.entity.ItemCompra;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CompraMapper {

    public CompraResponse toResponse(Compra entity) {
        return CompraResponse.builder()
                .id(entity.getId())
                .fornecedorId(entity.getFornecedor().getId())
                .fornecedorNome(entity.getFornecedor().getRazaoSocial())
                .dataCompra(entity.getDataCompra())
                .notaFiscal(entity.getNotaFiscal())
                .valorTotal(entity.getValorTotal())
                .itens(entity.getItens().stream()
                        .map(this::toItemResponse)
                        .collect(Collectors.toList()))
                .status(entity.getStatus())
                .build();
    }

    public ItemCompraResponse toItemResponse(ItemCompra item) {
        return ItemCompraResponse.builder()
                .id(item.getId())
                .insumoId(item.getInsumo().getId())
                .insumoNome(item.getInsumo().getNome())
                .quantidade(item.getQuantidade())
                .precoUnitario(item.getPrecoUnitario())
                .subtotal(item.getSubtotal())
                .build();
    }
}
