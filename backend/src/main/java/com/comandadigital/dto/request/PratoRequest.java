package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PratoRequest {

    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    private String nome;

    private String descricao;

    @NotNull(message = "Preco de venda e obrigatorio")
    @Positive(message = "Preco de venda deve ser positivo")
    private BigDecimal precoVenda;

    private Integer tempoPreparo;

    private String imagemUrl;

    @NotNull(message = "Categoria e obrigatoria")
    private Long categoriaId;
}
