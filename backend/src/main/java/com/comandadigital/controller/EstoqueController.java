package com.comandadigital.controller;

import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.service.EstoqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class EstoqueController {

    private final EstoqueService estoqueService;

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

    @GetMapping("/ordenado-validade")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<InsumoResponse>> ordenadoPorValidade() {
        return ResponseEntity.ok(estoqueService.listarOrdenadoPorValidade());
    }
}
