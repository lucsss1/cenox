package com.comandadigital.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CompraRequest {

    @NotNull(message = "Fornecedor e obrigatorio")
    private Long fornecedorId;

    @NotNull(message = "Data da compra e obrigatoria")
    private LocalDate dataCompra;

    private String notaFiscal;

    @NotNull(message = "Itens sao obrigatorios")
    @Valid
    private List<ItemCompraRequest> itens;
}
