package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PratoResponse {
    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal precoVenda;
    private BigDecimal custoProducao;
    private BigDecimal foodCost;
    private Integer tempoPreparo;
    private String imagemUrl;
    private Long categoriaId;
    private String categoriaNome;
    private boolean temFichaTecnica;
    private boolean foodCostAlto;
    private StatusGeral status;
}
