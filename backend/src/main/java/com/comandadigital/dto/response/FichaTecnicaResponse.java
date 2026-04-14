package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FichaTecnicaResponse {
    private Long id;
    private Long pratoId;
    private String pratoNome;
    private Integer rendimento;
    private BigDecimal custoTotal;
    private BigDecimal custoPorPorcao;
    private BigDecimal foodCost;
    private List<ItemFichaTecnicaResponse> itens;
    private StatusGeral status;
}
