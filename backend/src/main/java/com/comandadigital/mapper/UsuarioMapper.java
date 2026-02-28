package com.comandadigital.mapper;

import com.comandadigital.dto.request.UsuarioRequest;
import com.comandadigital.dto.response.UsuarioResponse;
import com.comandadigital.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioResponse toResponse(Usuario entity) {
        return UsuarioResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .email(entity.getEmail())
                .perfil(entity.getPerfil())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public Usuario toEntity(UsuarioRequest request) {
        return Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(request.getSenha())
                .perfil(request.getPerfil())
                .build();
    }
}
