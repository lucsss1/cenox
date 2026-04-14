package com.comandadigital.service;

import com.comandadigital.dto.request.UsuarioRequest;
import com.comandadigital.dto.request.UsuarioUpdateRequest;
import com.comandadigital.dto.response.UsuarioResponse;
import com.comandadigital.entity.Usuario;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.DuplicateResourceException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.UsuarioMapper;
import com.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repository.findByEmailAndStatus(email, StatusGeral.ATIVO)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + email));
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(Pageable pageable) {
        return repository.findByStatus(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = findActiveById(id);
        return mapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email ja cadastrado: " + request.getEmail());
        }

        Usuario usuario = mapper.toEntity(request);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario = repository.save(usuario);
        return mapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = findActiveById(id);

        if (!usuario.getEmail().equals(request.getEmail()) && repository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email ja cadastrado: " + request.getEmail());
        }

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        if (request.getPerfil() != null) {
            usuario.setPerfil(request.getPerfil());
        }
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        usuario = repository.save(usuario);
        return mapper.toResponse(usuario);
    }

    @Transactional
    public void desativar(Long id) {
        Usuario usuario = findActiveById(id);
        usuario.setStatus(StatusGeral.INATIVO);
        repository.save(usuario);
    }

    public Usuario findActiveById(Long id) {
        return repository.findById(id)
                .filter(u -> u.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + id));
    }
}
