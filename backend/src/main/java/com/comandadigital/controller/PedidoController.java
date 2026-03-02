package com.comandadigital.controller;

import com.comandadigital.dto.request.PedidoRequest;
import com.comandadigital.dto.response.PedidoResponse;
import com.comandadigital.entity.Usuario;
import com.comandadigital.enums.StatusPedido;
import com.comandadigital.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'COZINHEIRO')")
    public ResponseEntity<Page<PedidoResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(service.listar(pageable));
    }

    @GetMapping("/meus")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Page<PedidoResponse>> meusPedidos(
            @AuthenticationPrincipal Usuario usuario, Pageable pageable) {
        return ResponseEntity.ok(service.listarPorCliente(usuario.getId(), pageable));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'COZINHEIRO')")
    public ResponseEntity<Page<PedidoResponse>> listarPorStatus(
            @PathVariable StatusPedido status, Pageable pageable) {
        return ResponseEntity.ok(service.listarPorStatus(status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'COZINHEIRO', 'CLIENTE')")
    public ResponseEntity<PedidoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<PedidoResponse> criar(
            @Valid @RequestBody PedidoRequest request,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request, usuario));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'COZINHEIRO', 'CLIENTE')")
    public ResponseEntity<PedidoResponse> alterarStatus(
            @PathVariable Long id,
            @RequestParam StatusPedido status,
            @RequestParam(required = false) String motivo,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.alterarStatus(id, status, usuario, motivo));
    }
}
