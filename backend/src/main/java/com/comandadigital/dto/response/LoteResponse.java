package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoteResponse {
    private Long id;
    private Long insumoId;
    private String insumoNome;
    private String unidadeMedida;
    private String numeroLote;
    private BigDecimal quantidade;
    private BigDecimal quantidadeInicial;
    private LocalDate dataValidade;
    private Long fornecedorId;
    private String fornecedorNome;
    private Long compraId;
    private StatusGeral status;
    private boolean vencido;
    private boolean proximoVencimento;
    private long diasParaVencimento;
    private LocalDateTime createdAt;
}
