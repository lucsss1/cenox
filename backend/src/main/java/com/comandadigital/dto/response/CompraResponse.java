package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraResponse {
    private Long id;
    private Long fornecedorId;
    private String fornecedorNome;
    private LocalDate dataCompra;
    private String notaFiscal;
    private BigDecimal valorTotal;
    private List<ItemCompraResponse> itens;
    private StatusGeral status;
}
