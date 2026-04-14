package com.comandadigital.service;

import com.comandadigital.dto.request.FornecedorRequest;
import com.comandadigital.dto.response.FornecedorResponse;
import com.comandadigital.entity.Fornecedor;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.DuplicateResourceException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.FornecedorMapper;
import com.comandadigital.repository.FornecedorRepository;
import com.comandadigital.validation.CnpjValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final FornecedorRepository repository;
    private final FornecedorMapper mapper;

    @Transactional(readOnly = true)
    public Page<FornecedorResponse> listar(Pageable pageable) {
        return repository.findByStatus(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponse> listarTodos() {
        return repository.findAllByStatus(StatusGeral.ATIVO).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FornecedorResponse buscarPorId(Long id) {
        Fornecedor fornecedor = findActiveById(id);
        return mapper.toResponse(fornecedor);
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest request) {
        String cnpjFormatado = CnpjValidator.formatar(request.getCnpj());
        request.setCnpj(cnpjFormatado);
        if (repository.existsByCnpj(cnpjFormatado)) {
            throw new DuplicateResourceException("CNPJ ja cadastrado: " + cnpjFormatado);
        }
        Fornecedor fornecedor = mapper.toEntity(request);
        fornecedor = repository.save(fornecedor);
        return mapper.toResponse(fornecedor);
    }

    @Transactional
    public FornecedorResponse atualizar(Long id, FornecedorRequest request) {
        Fornecedor fornecedor = findActiveById(id);
        fornecedor.setNomeEmpresa(request.getNomeEmpresa());
        fornecedor.setRazaoSocial(request.getNomeEmpresa());
        fornecedor.setCnpj(CnpjValidator.formatar(request.getCnpj()));
        fornecedor.setEmail(request.getEmail());
        fornecedor.setTelefone(request.getTelefone());
        fornecedor.setEndereco(request.getEndereco());
        fornecedor.setResponsavelComercial(request.getResponsavelComercial());
        if (request.getStatusFornecedor() != null) {
            fornecedor.setStatusFornecedor(request.getStatusFornecedor());
        }
        fornecedor = repository.save(fornecedor);
        return mapper.toResponse(fornecedor);
    }

    @Transactional
    public void desativar(Long id) {
        Fornecedor fornecedor = findActiveById(id);
        fornecedor.setStatus(StatusGeral.INATIVO);
        repository.save(fornecedor);
    }

    public Fornecedor findActiveById(Long id) {
        return repository.findById(id)
                .filter(f -> f.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor nao encontrado: " + id));
    }
}
