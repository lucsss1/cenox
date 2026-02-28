package com.comandadigital.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FornecedorRequest {

    @NotBlank(message = "Razao social e obrigatoria")
    @Size(max = 200, message = "Razao social deve ter no maximo 200 caracteres")
    private String razaoSocial;

    @NotBlank(message = "CNPJ e obrigatorio")
    @Size(max = 18, message = "CNPJ deve ter no maximo 18 caracteres")
    private String cnpj;

    @Email(message = "Email invalido")
    private String email;

    private String telefone;

    private String endereco;
}
