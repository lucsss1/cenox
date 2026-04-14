package com.comandadigital.dto.request;

import com.comandadigital.enums.StatusFornecedor;
import com.comandadigital.validation.ValidCnpj;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FornecedorRequest {

    @NotBlank(message = "Nome da empresa e obrigatorio")
    @Size(max = 200, message = "Nome da empresa deve ter no maximo 200 caracteres")
    private String nomeEmpresa;

    @NotBlank(message = "CNPJ e obrigatorio")
    @ValidCnpj
    private String cnpj;

    @Email(message = "Email invalido")
    private String email;

    private String telefone;

    private String endereco;

    @Size(max = 150, message = "Responsavel comercial deve ter no maximo 150 caracteres")
    private String responsavelComercial;

    private StatusFornecedor statusFornecedor;
}
