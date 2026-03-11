package com.comandadigital.service;

import com.comandadigital.dto.request.FornecedorRequest;
import com.comandadigital.dto.response.FornecedorResponse;
import com.comandadigital.entity.Fornecedor;
import com.comandadigital.enums.StatusFornecedor;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.exception.DuplicateResourceException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.FornecedorMapper;
import com.comandadigital.repository.FornecedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    public List<FornecedorResponse> listarHomologados() {
        return repository.findAllByStatusAndStatusFornecedor(StatusGeral.ATIVO, StatusFornecedor.HOMOLOGADO).stream()
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
        if (repository.existsByCnpj(request.getCnpj())) {
            throw new DuplicateResourceException("CNPJ ja cadastrado: " + request.getCnpj());
        }
        Fornecedor fornecedor = mapper.toEntity(request);
        fornecedor = repository.save(fornecedor);
        return mapper.toResponse(fornecedor);
    }

    @Transactional
    public FornecedorResponse atualizar(Long id, FornecedorRequest request) {
        Fornecedor fornecedor = findActiveById(id);
        fornecedor.setNomeEmpresa(request.getNomeEmpresa());
        fornecedor.setCnpj(request.getCnpj());
        fornecedor.setEmail(request.getEmail());
        fornecedor.setTelefone(request.getTelefone());
        fornecedor.setEndereco(request.getEndereco());
        fornecedor.setResponsavelComercial(request.getResponsavelComercial());
        fornecedor.setObservacoes(request.getObservacoes());
        fornecedor.setPrazoEntregaDias(request.getPrazoEntregaDias());
        if (request.getAvaliacao() != null) {
            fornecedor.setAvaliacao(request.getAvaliacao());
        }
        if (request.getStatusFornecedor() != null) {
            alterarStatusFornecedor(fornecedor, request.getStatusFornecedor());
        }
        fornecedor = repository.save(fornecedor);
        return mapper.toResponse(fornecedor);
    }

    /**
     * Altera o status do fornecedor seguindo o ciclo de vida:
     * EM_AVALIACAO -> EM_HOMOLOGACAO -> HOMOLOGADO -> SUSPENSO / INATIVO
     * BLOQUEADO pode ser aplicado de qualquer estado.
     */
    private void alterarStatusFornecedor(Fornecedor fornecedor, StatusFornecedor novoStatus) {
        StatusFornecedor atual = fornecedor.getStatusFornecedor();

        // BLOQUEADO e INATIVO podem ser aplicados a partir de qualquer estado
        if (novoStatus == StatusFornecedor.BLOQUEADO || novoStatus == StatusFornecedor.INATIVO) {
            fornecedor.setStatusFornecedor(novoStatus);
            return;
        }

        boolean valido = switch (atual) {
            case EM_AVALIACAO -> novoStatus == StatusFornecedor.EM_HOMOLOGACAO;
            case EM_HOMOLOGACAO -> novoStatus == StatusFornecedor.HOMOLOGADO;
            case HOMOLOGADO -> novoStatus == StatusFornecedor.SUSPENSO;
            case SUSPENSO -> novoStatus == StatusFornecedor.HOMOLOGADO || novoStatus == StatusFornecedor.EM_AVALIACAO;
            case BLOQUEADO -> novoStatus == StatusFornecedor.EM_AVALIACAO;
            case INATIVO -> novoStatus == StatusFornecedor.EM_AVALIACAO;
        };

        if (!valido) {
            throw new BusinessException(
                    "Transicao de status do fornecedor invalida: " + atual + " -> " + novoStatus
            );
        }

        fornecedor.setStatusFornecedor(novoStatus);

        // Registrar data de homologacao quando fornecedor e homologado
        if (novoStatus == StatusFornecedor.HOMOLOGADO) {
            fornecedor.setDataHomologacao(LocalDate.now());
        }
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
