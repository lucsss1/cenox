package com.comandadigital.controller;

import com.comandadigital.dto.request.CompraRequest;
import com.comandadigital.dto.response.CompraResponse;
import com.comandadigital.enums.StatusCompra;
import com.comandadigital.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Page<CompraResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(service.listar(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CompraResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CompraResponse> criar(@Valid @RequestBody CompraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CompraResponse> atualizar(@PathVariable Long id, @Valid @RequestBody CompraRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CompraResponse> alterarStatus(
            @PathVariable Long id, @RequestParam StatusCompra status) {
        return ResponseEntity.ok(service.alterarStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        service.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
