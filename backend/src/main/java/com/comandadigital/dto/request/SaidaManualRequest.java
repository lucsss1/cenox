package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaidaManualRequest {

    @NotNull(message = "Quantidade e obrigatoria")
    @Positive(message = "Quantidade deve ser positiva")
    private BigDecimal quantidade;

    @NotNull(message = "Motivo e obrigatorio")
    private String motivo;
}
