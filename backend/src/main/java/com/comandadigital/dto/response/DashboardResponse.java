package com.comandadigital.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private BigDecimal faturamentoMensal;
    private long totalPedidosMes;
    private long pratosAtivos;
    private long insumosAbaixoMinimo;
    private BigDecimal totalComprasMes;
    private Map<String, Long> pedidosPorStatus;
    private List<PratoResponse> pratosFoodCostAlto;
    private List<InsumoResponse> insumosEstoqueBaixo;
    private List<FaturamentoDiarioResponse> faturamentoDiario;
    private List<TopPratosResponse> topPratos;
}
