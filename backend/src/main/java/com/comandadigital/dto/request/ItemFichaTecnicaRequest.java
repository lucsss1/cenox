package com.comandadigital.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemFichaTecnicaRequest {

    @NotNull(message = "Insumo e obrigatorio")
    private Long insumoId;

    @NotNull(message = "Quantidade bruta e obrigatoria")
    @Positive(message = "Quantidade bruta deve ser positiva")
    private BigDecimal quantidadeBruta;

    @NotNull(message = "Fator de correcao e obrigatorio")
    @DecimalMin(value = "1.0", message = "Fator de correcao deve ser >= 1.0")
    private BigDecimal fatorCorrecao;
}
