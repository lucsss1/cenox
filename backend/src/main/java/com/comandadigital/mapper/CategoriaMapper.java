package com.comandadigital.mapper;

import com.comandadigital.dto.request.CategoriaRequest;
import com.comandadigital.dto.response.CategoriaResponse;
import com.comandadigital.entity.Categoria;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {

    public CategoriaResponse toResponse(Categoria entity) {
        return CategoriaResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .status(entity.getStatus())
                .build();
    }

    public Categoria toEntity(CategoriaRequest request) {
        return Categoria.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .build();
    }
}
