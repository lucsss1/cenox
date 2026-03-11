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
                .nomeEmpresa(entity.getNomeEmpresa())
                .cnpj(entity.getCnpj())
                .email(entity.getEmail())
                .telefone(entity.getTelefone())
                .endereco(entity.getEndereco())
                .responsavelComercial(entity.getResponsavelComercial())
                .statusFornecedor(entity.getStatusFornecedor())
                .dataHomologacao(entity.getDataHomologacao())
                .avaliacao(entity.getAvaliacao())
                .observacoes(entity.getObservacoes())
                .prazoEntregaDias(entity.getPrazoEntregaDias())
                .status(entity.getStatus())
                .build();
    }

    public Fornecedor toEntity(FornecedorRequest request) {
        return Fornecedor.builder()
                .nomeEmpresa(request.getNomeEmpresa())
                .cnpj(request.getCnpj())
                .email(request.getEmail())
                .telefone(request.getTelefone())
                .endereco(request.getEndereco())
                .responsavelComercial(request.getResponsavelComercial())
                .statusFornecedor(request.getStatusFornecedor())
                .dataHomologacao(request.getDataHomologacao())
                .avaliacao(request.getAvaliacao())
                .observacoes(request.getObservacoes())
                .prazoEntregaDias(request.getPrazoEntregaDias())
                .build();
    }
}
