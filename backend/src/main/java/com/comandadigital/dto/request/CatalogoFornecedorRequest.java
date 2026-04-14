package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CatalogoFornecedorRequest {

    @NotNull(message = "Insumo e obrigatorio")
    private Long insumoId;

    @NotNull(message = "Preco e obrigatorio")
    @Positive(message = "Preco deve ser positivo")
    private BigDecimal preco;

    @NotNull(message = "Unidade de venda e obrigatoria")
    private String unidadeVenda;
}
