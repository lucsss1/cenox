package com.comandadigital.service;

import com.comandadigital.dto.response.*;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.mapper.InsumoMapper;
import com.comandadigital.mapper.PratoMapper;
import com.comandadigital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final PratoRepository pratoRepository;
    private final InsumoRepository insumoRepository;
    private final CompraRepository compraRepository;
    private final PratoMapper pratoMapper;
    private final InsumoMapper insumoMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDateTime inicioMesDt = inicioMes.atStartOfDay();
        LocalDateTime fimMesDt = hoje.atTime(LocalTime.MAX);

        BigDecimal faturamento = pedidoRepository.faturamentoPeriodo(inicioMesDt, fimMesDt);
        long totalPedidos = pedidoRepository.countPedidosPeriodo(inicioMesDt, fimMesDt);
        long pratosAtivos = pratoRepository.countByStatus(StatusGeral.ATIVO);

        List<InsumoResponse> insumosEstoqueBaixo = insumoRepository.findInsumosAbaixoEstoqueMinimo()
                .stream().map(insumoMapper::toResponse).collect(Collectors.toList());

        BigDecimal totalCompras = compraRepository.totalComprasPeriodo(inicioMes, hoje);

        Map<String, Long> pedidosPorStatus = new HashMap<>();
        pedidoRepository.countByStatusGroup().forEach(row -> {
            pedidosPorStatus.put(row[0].toString(), (Long) row[1]);
        });

        List<PratoResponse> foodCostAlto = pratoRepository
                .findPratosComFoodCostAlto(new BigDecimal("35"))
                .stream().map(pratoMapper::toResponse).collect(Collectors.toList());

        LocalDateTime inicio30 = hoje.minusDays(30).atStartOfDay();
        List<FaturamentoDiarioResponse> faturamentoDiario = pedidoRepository
                .faturamentoDiario(inicio30, fimMesDt)
                .stream()
                .map(row -> FaturamentoDiarioResponse.builder()
                        .data(row[0].toString())
                        .valor((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());

        // Top 5 pratos mais vendidos no mes
        List<TopPratosResponse> topPratos = pedidoRepository
                .findTopPratosVendidos(inicioMesDt, fimMesDt, PageRequest.of(0, 5))
                .stream()
                .map(row -> TopPratosResponse.builder()
                        .pratoId((Long) row[0])
                        .pratoNome((String) row[1])
                        .quantidadeVendida((Long) row[2])
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .faturamentoMensal(faturamento)
                .totalPedidosMes(totalPedidos)
                .pratosAtivos(pratosAtivos)
                .insumosAbaixoMinimo(insumosEstoqueBaixo.size())
                .totalComprasMes(totalCompras)
                .pedidosPorStatus(pedidosPorStatus)
                .pratosFoodCostAlto(foodCostAlto)
                .insumosEstoqueBaixo(insumosEstoqueBaixo)
                .faturamentoDiario(faturamentoDiario)
                .topPratos(topPratos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopPratosResponse> getTopPratos(LocalDate inicio, LocalDate fim) {
        return pedidoRepository
                .findTopPratosVendidos(inicio.atStartOfDay(), fim.atTime(LocalTime.MAX), PageRequest.of(0, 5))
                .stream()
                .map(row -> TopPratosResponse.builder()
                        .pratoId((Long) row[0])
                        .pratoNome((String) row[1])
                        .quantidadeVendida((Long) row[2])
                        .build())
                .collect(Collectors.toList());
    }
}
