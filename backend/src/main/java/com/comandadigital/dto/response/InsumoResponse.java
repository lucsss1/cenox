package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusGeral;
import com.comandadigital.enums.UnidadeMedida;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsumoResponse {
    private Long id;
    private String nome;
    private UnidadeMedida unidadeMedida;
    private BigDecimal quantidadeEstoque;
    private BigDecimal estoqueMinimo;
    private BigDecimal custoMedio;
    private boolean abaixoEstoqueMinimo;
    private String categoria;
    private LocalDate dataEntradaEstoque;
    private LocalDate dataValidade;
    private Long fornecedorId;
    private String fornecedorNome;
    private StatusGeral status;
}
