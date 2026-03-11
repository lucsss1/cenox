package com.comandadigital.controller;

import com.comandadigital.dto.request.LoteRequest;
import com.comandadigital.dto.response.LoteResponse;
import com.comandadigital.service.LoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LoteController {

    private final LoteService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Page<LoteResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(service.listarTodosPaginado(pageable));
    }

    @GetMapping("/insumo/{insumoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Page<LoteResponse>> listarPorInsumo(
            @PathVariable Long insumoId, Pageable pageable) {
        return ResponseEntity.ok(service.listarPorInsumo(insumoId, pageable));
    }

    @GetMapping("/vencidos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<LoteResponse>> lotesVencidos() {
        return ResponseEntity.ok(service.listarLotesVencidos());
    }

    @GetMapping("/proximos-vencimento")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<LoteResponse>> lotesProximosVencimento() {
        return ResponseEntity.ok(service.listarLotesProximosVencimento());
    }

    @GetMapping("/ordenado-validade")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<LoteResponse>> lotesOrdenadoPorValidade() {
        return ResponseEntity.ok(service.listarTodosOrdenadoPorValidade());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<LoteResponse> criar(@Valid @RequestBody LoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        service.desativarLote(id);
        return ResponseEntity.noContent().build();
    }
}
