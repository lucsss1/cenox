package com.comandadigital.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class FichaTecnicaRequest {

    @NotNull(message = "Prato e obrigatorio")
    private Long pratoId;

    @NotNull(message = "Rendimento e obrigatorio")
    @Positive(message = "Rendimento deve ser positivo")
    private Integer rendimento;

    @NotNull(message = "Itens sao obrigatorios")
    @Valid
    private List<ItemFichaTecnicaRequest> itens;
}
