package com.comandadigital.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class IngredienteMaisUsadoResponse {
    private Long insumoId;
    private String insumoNome;
    private BigDecimal quantidadeTotal;
    private String unidadeMedida;
}
