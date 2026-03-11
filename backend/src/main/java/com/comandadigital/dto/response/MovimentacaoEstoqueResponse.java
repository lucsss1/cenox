package com.comandadigital.dto.response;

import com.comandadigital.enums.TipoMovimentacao;
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
public class MovimentacaoEstoqueResponse {
    private Long id;
    private Long insumoId;
    private String insumoNome;
    private Long loteId;
    private String loteNumero;
    private TipoMovimentacao tipo;
    private BigDecimal quantidade;
    private String motivo;
    private String origem;
    private LocalDateTime createdAt;
}
