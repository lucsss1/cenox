package com.comandadigital.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemFichaTecnicaResponse {
    private Long id;
    private Long insumoId;
    private String insumoNome;
    private String unidadeMedida;
    private BigDecimal quantidadeBruta;
    private BigDecimal fatorCorrecao;
    private BigDecimal quantidadeLiquida;
    private BigDecimal custoItem;
}
