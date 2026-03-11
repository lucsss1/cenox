package com.comandadigital.service;

import com.comandadigital.dto.request.LoteRequest;
import com.comandadigital.dto.response.LoteResponse;
import com.comandadigital.entity.Compra;
import com.comandadigital.entity.Fornecedor;
import com.comandadigital.entity.Insumo;
import com.comandadigital.entity.Lote;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.repository.CompraRepository;
import com.comandadigital.repository.FornecedorRepository;
import com.comandadigital.repository.LoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final LoteRepository repository;
    private final InsumoService insumoService;
    private final FornecedorRepository fornecedorRepository;
    private final CompraRepository compraRepository;

    @Transactional(readOnly = true)
    public Page<LoteResponse> listarPorInsumo(Long insumoId, Pageable pageable) {
        return repository.findByInsumoIdAndStatusOrderByDataValidadeAsc(insumoId, StatusGeral.ATIVO, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> listarLotesVencidos() {
        return repository.findLotesVencidos(LocalDate.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> listarLotesProximosVencimento() {
        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(7);
        return repository.findLotesProximosVencimento(hoje, limite).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> listarTodosOrdenadoPorValidade() {
        return repository.findAllLotesAtivosOrdenadoPorValidade().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<LoteResponse> listarTodosPaginado(Pageable pageable) {
        return repository.findByStatusOrderByDataValidadeAsc(StatusGeral.ATIVO, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public LoteResponse criar(LoteRequest request) {
        Insumo insumo = insumoService.findActiveById(request.getInsumoId());

        Lote lote = Lote.builder()
                .insumo(insumo)
                .numeroLote(request.getNumeroLote())
                .quantidade(request.getQuantidade())
                .quantidadeInicial(request.getQuantidade())
                .dataValidade(request.getDataValidade())
                .build();

        if (request.getFornecedorId() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fornecedor nao encontrado: " + request.getFornecedorId()));
            lote.setFornecedor(fornecedor);
        }

        if (request.getCompraId() != null) {
            Compra compra = compraRepository.findById(request.getCompraId())
                    .orElseThrow(() -> new ResourceNotFoundException("Compra nao encontrada: " + request.getCompraId()));
            lote.setCompra(compra);
        }

        lote = repository.save(lote);
        return toResponse(lote);
    }

    @Transactional
    public Lote criarLoteInterno(Insumo insumo, BigDecimal quantidade, LocalDate dataValidade, Fornecedor fornecedor, Compra compra) {
        String numeroLote = gerarNumeroLote(insumo, compra);

        Lote lote = Lote.builder()
                .insumo(insumo)
                .numeroLote(numeroLote)
                .quantidade(quantidade)
                .quantidadeInicial(quantidade)
                .dataValidade(dataValidade)
                .fornecedor(fornecedor)
                .compra(compra)
                .build();

        return repository.save(lote);
    }

    @Transactional
    public void desativarLote(Long id) {
        Lote lote = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote nao encontrado: " + id));
        lote.setStatus(StatusGeral.INATIVO);
        repository.save(lote);
    }

    public List<Lote> buscarLotesFIFO(Long insumoId) {
        return repository.findLotesDisponiveisFIFO(insumoId);
    }

    public Lote findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote nao encontrado: " + id));
    }

    private String gerarNumeroLote(Insumo insumo, Compra compra) {
        String prefix = "LT";
        String insumoCode = String.format("%04d", insumo.getId());
        String timestamp = String.valueOf(System.currentTimeMillis() % 100000);
        String compraCode = compra != null ? "-C" + compra.getId() : "";
        return prefix + insumoCode + "-" + timestamp + compraCode;
    }

    public LoteResponse toResponse(Lote lote) {
        LocalDate hoje = LocalDate.now();
        boolean vencido = lote.getDataValidade() != null && lote.getDataValidade().isBefore(hoje);
        boolean proximoVencimento = lote.getDataValidade() != null
                && !lote.getDataValidade().isBefore(hoje)
                && lote.getDataValidade().isBefore(hoje.plusDays(7));
        long diasParaVencimento = lote.getDataValidade() != null
                ? ChronoUnit.DAYS.between(hoje, lote.getDataValidade())
                : Long.MAX_VALUE;

        return LoteResponse.builder()
                .id(lote.getId())
                .insumoId(lote.getInsumo().getId())
                .insumoNome(lote.getInsumo().getNome())
                .unidadeMedida(lote.getInsumo().getUnidadeMedida().name())
                .numeroLote(lote.getNumeroLote())
                .quantidade(lote.getQuantidade())
                .quantidadeInicial(lote.getQuantidadeInicial())
                .dataValidade(lote.getDataValidade())
                .fornecedorId(lote.getFornecedor() != null ? lote.getFornecedor().getId() : null)
                .fornecedorNome(lote.getFornecedor() != null ? lote.getFornecedor().getNomeEmpresa() : null)
                .compraId(lote.getCompra() != null ? lote.getCompra().getId() : null)
                .status(lote.getStatus())
                .vencido(vencido)
                .proximoVencimento(proximoVencimento)
                .diasParaVencimento(diasParaVencimento)
                .createdAt(lote.getCreatedAt())
                .build();
    }
}
