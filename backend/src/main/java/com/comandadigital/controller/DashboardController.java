package com.comandadigital.controller;

import com.comandadigital.dto.response.DashboardResponse;
import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.dto.response.MovimentacaoEstoqueResponse;
import com.comandadigital.dto.response.TopPratosResponse;
import com.comandadigital.service.DashboardService;
import com.comandadigital.service.EstoqueService;
import com.comandadigital.service.InsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;
    private final EstoqueService estoqueService;
    private final InsumoService insumoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(service.getDashboard());
    }

    @GetMapping("/top-pratos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<TopPratosResponse>> getTopPratos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(service.getTopPratos(inicio, fim));
    }

    @GetMapping("/estoque-baixo")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<InsumoResponse>> estoqueBaixo() {
        return ResponseEntity.ok(insumoService.listarAbaixoEstoqueMinimo());
    }

    @GetMapping("/proximos-vencimento")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<InsumoResponse>> proximosVencimento() {
        return ResponseEntity.ok(estoqueService.listarProximosVencimento());
    }

    @GetMapping("/vencidos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<InsumoResponse>> vencidos() {
        return ResponseEntity.ok(estoqueService.listarVencidos());
    }

    @GetMapping("/ultimas-entradas")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<MovimentacaoEstoqueResponse>> ultimasEntradas() {
        return ResponseEntity.ok(estoqueService.listarUltimasEntradas());
    }
}
