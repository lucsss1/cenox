package com.comandadigital.controller;

import com.comandadigital.dto.request.InsumoRequest;
import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.dto.response.MovimentacaoEstoqueResponse;
import com.comandadigital.service.EstoqueService;
import com.comandadigital.service.InsumoService;
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
@RequestMapping("/api/insumos")
@RequiredArgsConstructor
public class InsumoController {

    private final InsumoService service;
    private final EstoqueService estoqueService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Page<InsumoResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(service.listar(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<InsumoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/estoque-baixo")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<InsumoResponse>> listarEstoqueBaixo() {
        return ResponseEntity.ok(service.listarAbaixoEstoqueMinimo());
    }

    @GetMapping("/{id}/movimentacoes")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Page<MovimentacaoEstoqueResponse>> listarMovimentacoes(
            @PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(estoqueService.listarMovimentacoes(id, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<InsumoResponse> criar(@Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<InsumoResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        service.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
