package com.comandadigital.service;

import com.comandadigital.dto.request.CategoriaRequest;
import com.comandadigital.dto.response.CategoriaResponse;
import com.comandadigital.entity.Categoria;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.CategoriaMapper;
import com.comandadigital.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repository;
    private final CategoriaMapper mapper;

    @Transactional(readOnly = true)
    public Page<CategoriaResponse> listar(Pageable pageable) {
        return repository.findByStatus(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodas() {
        return repository.findAllByStatus(StatusGeral.ATIVO).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id) {
        Categoria categoria = findActiveById(id);
        return mapper.toResponse(categoria);
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        Categoria categoria = mapper.toEntity(request);
        categoria = repository.save(categoria);
        return mapper.toResponse(categoria);
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = findActiveById(id);
        categoria.setNome(request.getNome());
        categoria.setDescricao(request.getDescricao());
        categoria = repository.save(categoria);
        return mapper.toResponse(categoria);
    }

    @Transactional
    public void desativar(Long id) {
        Categoria categoria = findActiveById(id);
        categoria.setStatus(StatusGeral.INATIVO);
        repository.save(categoria);
    }

    public Categoria findActiveById(Long id) {
        return repository.findById(id)
                .filter(c -> c.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria nao encontrada: " + id));
    }
}
