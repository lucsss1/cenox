package com.comandadigital.dto.response;

import com.comandadigital.enums.Perfil;
import com.comandadigital.enums.StatusGeral;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponse {
    private Long id;
    private String nome;
    private String email;
    private Perfil perfil;
    private StatusGeral status;
    private LocalDateTime createdAt;
}
