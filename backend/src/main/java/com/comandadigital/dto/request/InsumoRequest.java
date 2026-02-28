package com.comandadigital.dto.request;

import com.comandadigital.enums.UnidadeMedida;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InsumoRequest {

    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    private String nome;

    @NotNull(message = "Unidade de medida e obrigatoria")
    private UnidadeMedida unidadeMedida;

    @NotNull(message = "Estoque minimo e obrigatorio")
    @PositiveOrZero(message = "Estoque minimo deve ser zero ou positivo")
    private BigDecimal estoqueMinimo;

    @PositiveOrZero(message = "Custo medio deve ser zero ou positivo")
    private BigDecimal custoMedio;
}
