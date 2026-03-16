package com.comandadigital.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class RelatorioFinanceiroResponse {
    private BigDecimal faturamentoTotal;
    private long totalPedidos;
    private BigDecimal ticketMedio;
    private BigDecimal totalCompras;
    private BigDecimal lucroEstimado;
    private List<FaturamentoDiarioResponse> faturamentoDiario;
    private List<TopPratosResponse> topPratos;
    private List<TopPratosResponse> pioresPratos;
}
