package com.comandadigital.service;

import com.comandadigital.dto.request.PratoRequest;
import com.comandadigital.dto.response.PratoResponse;
import com.comandadigital.entity.Categoria;
import com.comandadigital.entity.Prato;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.PratoMapper;
import com.comandadigital.repository.FichaTecnicaRepository;
import com.comandadigital.repository.PratoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PratoService {

    private final PratoRepository repository;
    private final FichaTecnicaRepository fichaTecnicaRepository;
    private final PratoMapper mapper;
    private final CategoriaService categoriaService;

    @Transactional(readOnly = true)
    public Page<PratoResponse> listar(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PratoResponse> listarCardapioPublico(Pageable pageable) {
        return repository.findAtivosComFichaTecnica(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PratoResponse> listarPorCategoria(Long categoriaId, Pageable pageable) {
        return repository.findByCategoriaIdAndStatus(categoriaId, StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PratoResponse buscarPorId(Long id) {
        Prato prato = findActiveOrInactiveById(id);
        return mapper.toResponse(prato);
    }

    @Transactional
    public PratoResponse criar(PratoRequest request) {
        Categoria categoria = categoriaService.findActiveById(request.getCategoriaId());

        Prato prato = mapper.toEntity(request);
        prato.setCategoria(categoria);
        // Prato inicia INATIVO - so ativa com ficha tecnica
        prato.setStatus(StatusGeral.INATIVO);
        prato = repository.save(prato);
        return mapper.toResponse(prato);
    }

    @Transactional
    public PratoResponse atualizar(Long id, PratoRequest request) {
        Prato prato = findActiveOrInactiveById(id);
        Categoria categoria = categoriaService.findActiveById(request.getCategoriaId());

        prato.setNome(request.getNome());
        prato.setDescricao(request.getDescricao());
        prato.setPrecoVenda(request.getPrecoVenda());
        prato.setTempoPreparo(request.getTempoPreparo());
        prato.setImagemUrl(request.getImagemUrl());
        prato.setCategoria(categoria);

        // Recalcula food cost se tiver custo producao
        if (prato.getCustoProducao() != null) {
            BigDecimal foodCost = prato.getCustoProducao()
                    .divide(prato.getPrecoVenda(), 2, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            prato.setFoodCost(foodCost);
        }

        prato = repository.save(prato);
        return mapper.toResponse(prato);
    }

    @Transactional
    public void ativar(Long id) {
        Prato prato = findActiveOrInactiveById(id);
        if (!prato.temFichaTecnica()) {
            throw new BusinessException("Prato so pode ser ativado se possuir ficha tecnica");
        }
        prato.setStatus(StatusGeral.ATIVO);
        repository.save(prato);
    }

    @Transactional
    public void desativar(Long id) {
        Prato prato = findActiveOrInactiveById(id);

        if (prato.getStatus() == StatusGeral.INATIVO) {
            // INATIVO -> delete permanente
            fichaTecnicaRepository.findByPratoId(id)
                    .ifPresent(fichaTecnicaRepository::delete);
            repository.delete(prato);
        } else {
            // ATIVO -> soft delete (INATIVO)
            prato.setStatus(StatusGeral.INATIVO);
            repository.save(prato);
        }
    }

    @Transactional(readOnly = true)
    public List<PratoResponse> listarFoodCostAlto() {
        return repository.findPratosComFoodCostAlto(new BigDecimal("35")).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public Prato findActiveById(Long id) {
        return repository.findById(id)
                .filter(p -> p.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Prato nao encontrado: " + id));
    }

    public Prato findActiveOrInactiveById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prato nao encontrado: " + id));
    }
}
