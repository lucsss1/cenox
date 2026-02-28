package com.comandadigital.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PedidoRequest {

    private String observacao;

    @NotNull(message = "Itens sao obrigatorios")
    @Valid
    private List<ItemPedidoRequest> itens;
}
