package com.comandadigital.mapper;

import com.comandadigital.dto.request.PratoRequest;
import com.comandadigital.dto.response.PratoResponse;
import com.comandadigital.entity.Prato;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PratoMapper {

    public PratoResponse toResponse(Prato entity) {
        return PratoResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .precoVenda(entity.getPrecoVenda())
                .custoProducao(entity.getCustoProducao())
                .foodCost(entity.getFoodCost())
                .tempoPreparo(entity.getTempoPreparo())
                .imagemUrl(entity.getImagemUrl())
                .categoriaId(entity.getCategoria().getId())
                .categoriaNome(entity.getCategoria().getNome())
                .temFichaTecnica(entity.temFichaTecnica())
                .foodCostAlto(entity.getFoodCost() != null && entity.getFoodCost().compareTo(new BigDecimal("35")) > 0)
                .status(entity.getStatus())
                .build();
    }

    public Prato toEntity(PratoRequest request) {
        return Prato.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .precoVenda(request.getPrecoVenda())
                .tempoPreparo(request.getTempoPreparo())
                .imagemUrl(request.getImagemUrl())
                .build();
    }
}
