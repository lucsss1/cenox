package com.comandadigital.mapper;

import com.comandadigital.dto.response.FichaTecnicaResponse;
import com.comandadigital.dto.response.ItemFichaTecnicaResponse;
import com.comandadigital.entity.FichaTecnica;
import com.comandadigital.entity.ItemFichaTecnica;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class FichaTecnicaMapper {

    public FichaTecnicaResponse toResponse(FichaTecnica entity) {
        return FichaTecnicaResponse.builder()
                .id(entity.getId())
                .pratoId(entity.getPrato().getId())
                .pratoNome(entity.getPrato().getNome())
                .rendimento(entity.getRendimento())
                .custoTotal(entity.getCustoTotal())
                .custoPorPorcao(entity.getCustoPorPorcao())
                .foodCost(entity.getPrato().getFoodCost())
                .itens(entity.getItens().stream()
                        .map(this::toItemResponse)
                        .collect(Collectors.toList()))
                .status(entity.getStatus())
                .build();
    }

    public ItemFichaTecnicaResponse toItemResponse(ItemFichaTecnica item) {
        return ItemFichaTecnicaResponse.builder()
                .id(item.getId())
                .insumoId(item.getInsumo().getId())
                .insumoNome(item.getInsumo().getNome())
                .unidadeMedida(item.getInsumo().getUnidadeMedida().name())
                .quantidadeBruta(item.getQuantidadeBruta())
                .fatorCorrecao(item.getFatorCorrecao())
                .quantidadeLiquida(item.getQuantidadeLiquida())
                .custoItem(item.getCustoItem())
                .build();
    }
}
