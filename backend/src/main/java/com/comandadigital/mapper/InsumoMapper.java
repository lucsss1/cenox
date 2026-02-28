package com.comandadigital.mapper;

import com.comandadigital.dto.request.InsumoRequest;
import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.entity.Insumo;
import org.springframework.stereotype.Component;

@Component
public class InsumoMapper {

    public InsumoResponse toResponse(Insumo entity) {
        return InsumoResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .unidadeMedida(entity.getUnidadeMedida())
                .quantidadeEstoque(entity.getQuantidadeEstoque())
                .estoqueMinimo(entity.getEstoqueMinimo())
                .custoMedio(entity.getCustoMedio())
                .abaixoEstoqueMinimo(entity.getQuantidadeEstoque().compareTo(entity.getEstoqueMinimo()) <= 0)
                .status(entity.getStatus())
                .build();
    }

    public Insumo toEntity(InsumoRequest request) {
        return Insumo.builder()
                .nome(request.getNome())
                .unidadeMedida(request.getUnidadeMedida())
                .estoqueMinimo(request.getEstoqueMinimo())
                .custoMedio(request.getCustoMedio())
                .build();
    }
}
