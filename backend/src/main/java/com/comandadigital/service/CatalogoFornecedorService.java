package com.comandadigital.service;

import com.comandadigital.dto.request.CatalogoFornecedorRequest;
import com.comandadigital.dto.response.CatalogoFornecedorResponse;
import com.comandadigital.dto.response.HistoricoPrecoResponse;
import com.comandadigital.entity.CatalogoFornecedor;
import com.comandadigital.entity.Fornecedor;
import com.comandadigital.entity.Insumo;
import com.comandadigital.enums.UnidadeMedida;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.repository.CatalogoFornecedorRepository;
import com.comandadigital.repository.HistoricoPrecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogoFornecedorService {

    private final CatalogoFornecedorRepository repository;
    private final HistoricoPrecoRepository historicoPrecoRepository;
    private final FornecedorService fornecedorService;
    private final InsumoService insumoService;

    @Transactional(readOnly = true)
    public List<CatalogoFornecedorResponse> listarPorFornecedor(Long fornecedorId) {
        return repository.findByFornecedorId(fornecedorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CatalogoFornecedorResponse> cotacaoPorInsumo(Long insumoId) {
        return repository.findByInsumoIdOrderByPrecoAsc(insumoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CatalogoFornecedorResponse criar(Long fornecedorId, CatalogoFornecedorRequest request) {
        Fornecedor fornecedor = fornecedorService.findActiveById(fornecedorId);
        Insumo insumo = insumoService.findActiveById(request.getInsumoId());

        if (repository.existsByFornecedorIdAndInsumoId(fornecedorId, request.getInsumoId())) {
            throw new BusinessException("Este fornecedor ja possui este insumo no catalogo. Use a edicao para alterar o preco.");
        }

        CatalogoFornecedor catalogo = CatalogoFornecedor.builder()
                .fornecedor(fornecedor)
                .insumo(insumo)
                .preco(request.getPreco())
                .unidadeVenda(UnidadeMedida.valueOf(request.getUnidadeVenda()))
                .build();

        catalogo = repository.save(catalogo);
        return toResponse(catalogo);
    }

    @Transactional
    public CatalogoFornecedorResponse atualizar(Long id, CatalogoFornecedorRequest request) {
        CatalogoFornecedor catalogo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item do catalogo nao encontrado: " + id));

        catalogo.setPreco(request.getPreco());
        catalogo.setUnidadeVenda(UnidadeMedida.valueOf(request.getUnidadeVenda()));

        catalogo = repository.save(catalogo);
        return toResponse(catalogo);
    }

    @Transactional
    public void excluir(Long id) {
        CatalogoFornecedor catalogo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item do catalogo nao encontrado: " + id));
        repository.delete(catalogo);
    }

    @Transactional(readOnly = true)
    public List<HistoricoPrecoResponse> historicoPrecos(Long insumoId) {
        return historicoPrecoRepository.findByInsumoIdOrderByDataRegistroAsc(insumoId).stream()
                .map(h -> HistoricoPrecoResponse.builder()
                        .id(h.getId())
                        .insumoId(h.getInsumo().getId())
                        .insumoNome(h.getInsumo().getNome())
                        .fornecedorId(h.getFornecedor().getId())
                        .fornecedorNome(h.getFornecedor().getRazaoSocial())
                        .preco(h.getPreco())
                        .dataRegistro(h.getDataRegistro().toString())
                        .build())
                .collect(Collectors.toList());
    }

    private CatalogoFornecedorResponse toResponse(CatalogoFornecedor entity) {
        return CatalogoFornecedorResponse.builder()
                .id(entity.getId())
                .fornecedorId(entity.getFornecedor().getId())
                .fornecedorNome(entity.getFornecedor().getRazaoSocial())
                .insumoId(entity.getInsumo().getId())
                .insumoNome(entity.getInsumo().getNome())
                .preco(entity.getPreco())
                .unidadeVenda(entity.getUnidadeVenda().name())
                .build();
    }
}
