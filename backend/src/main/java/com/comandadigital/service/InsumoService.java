package com.comandadigital.service;

import com.comandadigital.dto.request.InsumoRequest;
import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.entity.Insumo;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.InsumoMapper;
import com.comandadigital.repository.InsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final InsumoRepository repository;
    private final InsumoMapper mapper;

    @Transactional(readOnly = true)
    public Page<InsumoResponse> listar(Pageable pageable) {
        return repository.findByStatus(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public InsumoResponse buscarPorId(Long id) {
        Insumo insumo = findActiveById(id);
        return mapper.toResponse(insumo);
    }

    @Transactional
    public InsumoResponse criar(InsumoRequest request) {
        Insumo insumo = mapper.toEntity(request);
        insumo = repository.save(insumo);
        return mapper.toResponse(insumo);
    }

    @Transactional
    public InsumoResponse atualizar(Long id, InsumoRequest request) {
        Insumo insumo = findActiveById(id);
        insumo.setNome(request.getNome());
        insumo.setUnidadeMedida(request.getUnidadeMedida());
        insumo.setEstoqueMinimo(request.getEstoqueMinimo());
        if (request.getCustoMedio() != null) {
            insumo.setCustoMedio(request.getCustoMedio());
        }
        insumo = repository.save(insumo);
        return mapper.toResponse(insumo);
    }

    @Transactional
    public void desativar(Long id) {
        Insumo insumo = findActiveById(id);
        insumo.setStatus(StatusGeral.INATIVO);
        repository.save(insumo);
    }

    @Transactional(readOnly = true)
    public List<InsumoResponse> listarAbaixoEstoqueMinimo() {
        return repository.findInsumosAbaixoEstoqueMinimo().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public Insumo findActiveById(Long id) {
        return repository.findById(id)
                .filter(i -> i.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo nao encontrado: " + id));
    }
}
