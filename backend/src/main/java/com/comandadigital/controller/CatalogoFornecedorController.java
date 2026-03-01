package com.comandadigital.controller;

import com.comandadigital.dto.request.CatalogoFornecedorRequest;
import com.comandadigital.dto.response.CatalogoFornecedorResponse;
import com.comandadigital.dto.response.HistoricoPrecoResponse;
import com.comandadigital.service.CatalogoFornecedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
@RequiredArgsConstructor
public class CatalogoFornecedorController {

    private final CatalogoFornecedorService service;

    @GetMapping("/fornecedor/{fornecedorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<CatalogoFornecedorResponse>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        return ResponseEntity.ok(service.listarPorFornecedor(fornecedorId));
    }

    @GetMapping("/cotacao/{insumoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<CatalogoFornecedorResponse>> cotacaoPorInsumo(@PathVariable Long insumoId) {
        return ResponseEntity.ok(service.cotacaoPorInsumo(insumoId));
    }

    @PostMapping("/fornecedor/{fornecedorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CatalogoFornecedorResponse> criar(
            @PathVariable Long fornecedorId,
            @Valid @RequestBody CatalogoFornecedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(fornecedorId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CatalogoFornecedorResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CatalogoFornecedorRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/historico/{insumoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<HistoricoPrecoResponse>> historicoPrecos(@PathVariable Long insumoId) {
        return ResponseEntity.ok(service.historicoPrecos(insumoId));
    }
}
