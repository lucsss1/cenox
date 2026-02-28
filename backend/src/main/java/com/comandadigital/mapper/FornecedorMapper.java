package com.comandadigital.mapper;

import com.comandadigital.dto.request.FornecedorRequest;
import com.comandadigital.dto.response.FornecedorResponse;
import com.comandadigital.entity.Fornecedor;
import org.springframework.stereotype.Component;

@Component
public class FornecedorMapper {

    public FornecedorResponse toResponse(Fornecedor entity) {
        return FornecedorResponse.builder()
                .id(entity.getId())
                .razaoSocial(entity.getRazaoSocial())
                .cnpj(entity.getCnpj())
                .email(entity.getEmail())
                .telefone(entity.getTelefone())
                .endereco(entity.getEndereco())
                .status(entity.getStatus())
                .build();
    }

    public Fornecedor toEntity(FornecedorRequest request) {
        return Fornecedor.builder()
                .razaoSocial(request.getRazaoSocial())
                .cnpj(request.getCnpj())
                .email(request.getEmail())
                .telefone(request.getTelefone())
                .endereco(request.getEndereco())
                .build();
    }
}
