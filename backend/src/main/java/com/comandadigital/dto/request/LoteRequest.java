package com.comandadigital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoteRequest {

    @NotNull(message = "Insumo e obrigatorio")
    private Long insumoId;

    @NotBlank(message = "Numero do lote e obrigatorio")
    @Size(max = 50, message = "Numero do lote deve ter no maximo 50 caracteres")
    private String numeroLote;

    @NotNull(message = "Quantidade e obrigatoria")
    @Positive(message = "Quantidade deve ser positiva")
    private BigDecimal quantidade;

    private LocalDate dataValidade;

    private Long fornecedorId;

    private Long compraId;
}
