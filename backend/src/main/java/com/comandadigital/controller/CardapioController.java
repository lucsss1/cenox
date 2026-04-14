package com.comandadigital.controller;

import com.comandadigital.dto.response.PratoResponse;
import com.comandadigital.service.PratoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cardapio")
@RequiredArgsConstructor
public class CardapioController {

    private final PratoService pratoService;

    @GetMapping
    public ResponseEntity<Page<PratoResponse>> listarCardapio(Pageable pageable) {
        return ResponseEntity.ok(pratoService.listarCardapioPublico(pageable));
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<Page<PratoResponse>> listarPorCategoria(
            @PathVariable Long categoriaId, Pageable pageable) {
        return ResponseEntity.ok(pratoService.listarPorCategoria(categoriaId, pageable));
    }
}
