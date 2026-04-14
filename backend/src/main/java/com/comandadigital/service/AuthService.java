package com.comandadigital.service;

import com.comandadigital.config.JwtService;
import com.comandadigital.dto.request.LoginRequest;
import com.comandadigital.dto.request.UsuarioRequest;
import com.comandadigital.dto.response.LoginResponse;
import com.comandadigital.dto.response.UsuarioResponse;
import com.comandadigital.entity.Usuario;
import com.comandadigital.enums.Perfil;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.DuplicateResourceException;
import com.comandadigital.mapper.UsuarioMapper;
import com.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        Usuario usuario = repository.findByEmailAndStatus(request.getEmail(), StatusGeral.ATIVO)
                .orElseThrow(() -> new BadCredentialsException("Credenciais invalidas"));

        String token = jwtService.generateToken(usuario);

        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .usuario(mapper.toResponse(usuario))
                .build();
    }

    @Transactional
    public UsuarioResponse registrar(UsuarioRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email ja cadastrado: " + request.getEmail());
        }

        Usuario usuario = mapper.toEntity(request);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setPerfil(Perfil.CLIENTE);
        usuario = repository.save(usuario);

        return mapper.toResponse(usuario);
    }
}
