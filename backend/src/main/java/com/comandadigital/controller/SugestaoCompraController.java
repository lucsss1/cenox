package com.comandadigital.controller;

import com.comandadigital.dto.response.SugestaoCompraResponse;
import com.comandadigital.service.SugestaoCompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sugestoes-compra")
@RequiredArgsConstructor
public class SugestaoCompraController {

    private final SugestaoCompraService service;

    @PostMapping("/calcular")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<SugestaoCompraResponse>> calcularSugestoes() {
        return ResponseEntity.ok(service.calcularSugestoes());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<SugestaoCompraResponse>> listarPendentes() {
        return ResponseEntity.ok(service.listarSugestoesPendentes());
    }
}
