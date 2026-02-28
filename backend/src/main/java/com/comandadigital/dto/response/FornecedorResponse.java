package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FornecedorResponse {
    private Long id;
    private String razaoSocial;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private StatusGeral status;
}
