package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemCompraRequest {

    @NotNull(message = "Insumo e obrigatorio")
    private Long insumoId;

    @NotNull(message = "Quantidade e obrigatoria")
    @Positive(message = "Quantidade deve ser positiva")
    private BigDecimal quantidade;

    @NotNull(message = "Preco unitario e obrigatorio")
    @Positive(message = "Preco unitario deve ser positivo")
    private BigDecimal precoUnitario;
}
