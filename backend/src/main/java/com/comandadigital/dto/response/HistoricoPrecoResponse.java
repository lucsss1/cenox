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
public class HistoricoPrecoResponse {
    private Long id;
    private Long insumoId;
    private String insumoNome;
    private Long fornecedorId;
    private String fornecedorNome;
    private BigDecimal preco;
    private String dataRegistro;
}
