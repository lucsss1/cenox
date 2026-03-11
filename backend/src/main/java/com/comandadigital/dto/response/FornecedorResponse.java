package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusFornecedor;
import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FornecedorResponse {
    private Long id;
    private String nomeEmpresa;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private String responsavelComercial;
    private StatusFornecedor statusFornecedor;
    private LocalDate dataHomologacao;
    private BigDecimal avaliacao;
    private String observacoes;
    private Integer prazoEntregaDias;
    private StatusGeral status;
}
