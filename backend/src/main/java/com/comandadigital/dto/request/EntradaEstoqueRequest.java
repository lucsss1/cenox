package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EntradaEstoqueRequest {

    @NotNull(message = "Quantidade e obrigatoria")
    @Positive(message = "Quantidade deve ser positiva")
    private BigDecimal quantidade;

    @Size(max = 255, message = "Observacao deve ter no maximo 255 caracteres")
    private String observacao;
}
