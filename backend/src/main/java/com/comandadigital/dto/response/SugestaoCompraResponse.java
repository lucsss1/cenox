package com.comandadigital.dto.response;

import com.comandadigital.enums.PrioridadeSugestao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SugestaoCompraResponse {
    private Long id;
    private Long insumoId;
    private String insumoNome;
    private String unidadeMedida;
    private Long fornecedorId;
    private String fornecedorNome;
    private BigDecimal quantidadeSugerida;
    private BigDecimal estoqueAtual;
    private BigDecimal estoqueMinimo;
    private BigDecimal estoqueIdeal;
    private BigDecimal consumoMedioDiario;
    private Integer diasCobertura;
    private PrioridadeSugestao prioridade;
    private String status;
    private BigDecimal custoEstimado;
    private LocalDateTime createdAt;
}
