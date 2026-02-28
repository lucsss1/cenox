package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ItemPedidoRequest {

    @NotNull(message = "Prato e obrigatorio")
    private Long pratoId;

    @NotNull(message = "Quantidade e obrigatoria")
    @Positive(message = "Quantidade deve ser positiva")
    private Integer quantidade;

    private String observacao;
}
