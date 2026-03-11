package com.comandadigital.service;

import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.dto.response.LoteResponse;
import com.comandadigital.dto.response.MovimentacaoEstoqueResponse;
import com.comandadigital.entity.Insumo;
import com.comandadigital.entity.Lote;
import com.comandadigital.entity.MovimentacaoEstoque;
import com.comandadigital.enums.MotivoSaida;
import com.comandadigital.enums.TipoMovimentacao;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.mapper.InsumoMapper;
import com.comandadigital.repository.InsumoRepository;
import com.comandadigital.repository.LoteRepository;
import com.comandadigital.repository.MovimentacaoEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final InsumoRepository insumoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final LoteRepository loteRepository;
    private final InsumoMapper insumoMapper;

    /**
     * Registra entrada de estoque e cria movimentacao.
     * Se um lote for fornecido, associa a movimentacao ao lote.
     */
    @Transactional
    public void registrarEntrada(Insumo insumo, BigDecimal quantidade, String motivo) {
        registrarEntrada(insumo, quantidade, motivo, null, null);
    }

    @Transactional
    public void registrarEntrada(Insumo insumo, BigDecimal quantidade, String motivo, Lote lote, String origem) {
        insumo.setQuantidadeEstoque(insumo.getQuantidadeEstoque().add(quantidade));
        insumo.setDataEntradaEstoque(LocalDate.now());
        insumoRepository.save(insumo);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .insumo(insumo)
                .lote(lote)
                .tipo(TipoMovimentacao.ENTRADA)
                .quantidade(quantidade)
                .motivo(motivo)
                .origem(origem)
                .build();
        movimentacaoRepository.save(movimentacao);
    }

    /**
     * Registra saida de estoque usando FIFO (First In, First Out).
     * Consome dos lotes com validade mais proxima primeiro.
     */
    @Transactional
    public void registrarSaida(Insumo insumo, BigDecimal quantidade, String motivo) {
        registrarSaidaFIFO(insumo, quantidade, motivo, null);
    }

    @Transactional
    public void registrarSaidaFIFO(Insumo insumo, BigDecimal quantidade, String motivo, String origem) {
        if (insumo.getQuantidadeEstoque().compareTo(quantidade) < 0) {
            throw new BusinessException(
                    "Estoque insuficiente para o insumo: " + insumo.getNome() +
                    ". Disponivel: " + insumo.getQuantidadeEstoque() +
                    ", Solicitado: " + quantidade
            );
        }

        // FIFO: consume from lots with earliest expiration first
        List<Lote> lotes = loteRepository.findLotesDisponiveisFIFO(insumo.getId());
        BigDecimal restante = quantidade;

        for (Lote lote : lotes) {
            if (restante.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal disponivel = lote.getQuantidade();
            BigDecimal consumir = restante.min(disponivel);

            lote.setQuantidade(disponivel.subtract(consumir));
            loteRepository.save(lote);

            // Record per-lot movement
            MovimentacaoEstoque movLote = MovimentacaoEstoque.builder()
                    .insumo(insumo)
                    .lote(lote)
                    .tipo(TipoMovimentacao.SAIDA)
                    .quantidade(consumir)
                    .motivo(motivo)
                    .origem(origem)
                    .build();
            movimentacaoRepository.save(movLote);

            restante = restante.subtract(consumir);
        }

        // If there's remaining quantity not covered by lots, still record
        // (for backward compatibility with insumos that have no lots yet)
        if (restante.compareTo(BigDecimal.ZERO) > 0) {
            MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                    .insumo(insumo)
                    .tipo(TipoMovimentacao.SAIDA)
                    .quantidade(restante)
                    .motivo(motivo + " (sem lote)")
                    .origem(origem)
                    .build();
            movimentacaoRepository.save(movimentacao);
        }

        // Update aggregate stock
        insumo.setQuantidadeEstoque(insumo.getQuantidadeEstoque().subtract(quantidade));
        insumoRepository.save(insumo);
    }

    @Transactional
    public void registrarEstorno(Insumo insumo, BigDecimal quantidade, String motivo) {
        insumo.setQuantidadeEstoque(insumo.getQuantidadeEstoque().add(quantidade));
        insumoRepository.save(insumo);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .insumo(insumo)
                .tipo(TipoMovimentacao.ESTORNO)
                .quantidade(quantidade)
                .motivo(motivo)
                .origem("CANCELAMENTO_PEDIDO")
                .build();
        movimentacaoRepository.save(movimentacao);
    }

    @Transactional
    public void registrarSaidaManual(Insumo insumo, BigDecimal quantidade, MotivoSaida motivoSaida) {
        registrarSaidaFIFO(insumo, quantidade, "Saida manual - " + motivoSaida.name(), "SAIDA_MANUAL");
    }

    @Transactional
    public void registrarAjuste(Insumo insumo, BigDecimal novaQuantidade, String motivo) {
        BigDecimal diferenca = novaQuantidade.subtract(insumo.getQuantidadeEstoque());
        insumo.setQuantidadeEstoque(novaQuantidade);
        insumoRepository.save(insumo);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .insumo(insumo)
                .tipo(TipoMovimentacao.AJUSTE)
                .quantidade(diferenca.abs())
                .motivo(motivo + " (ajuste de " + insumo.getQuantidadeEstoque() + " para " + novaQuantidade + ")")
                .origem("AJUSTE_MANUAL")
                .build();
        movimentacaoRepository.save(movimentacao);
    }

    @Transactional(readOnly = true)
    public boolean verificarDisponibilidade(Insumo insumo, BigDecimal quantidadeNecessaria) {
        return insumo.getQuantidadeEstoque().compareTo(quantidadeNecessaria) >= 0;
    }

    @Transactional(readOnly = true)
    public Page<MovimentacaoEstoqueResponse> listarMovimentacoes(Long insumoId, Pageable pageable) {
        return movimentacaoRepository.findByInsumoId(insumoId, pageable)
                .map(this::toMovimentacaoResponse);
    }

    @Transactional(readOnly = true)
    public List<InsumoResponse> listarVencidos() {
        return insumoRepository.findVencidos(LocalDate.now()).stream()
                .map(insumoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InsumoResponse> listarProximosVencimento() {
        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(3);
        return insumoRepository.findProximosVencimento(hoje, limite).stream()
                .map(insumoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InsumoResponse> listarOrdenadoPorValidade() {
        return insumoRepository.findAllOrdenadoPorValidade().stream()
                .map(insumoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoEstoqueResponse> listarUltimasEntradas() {
        return movimentacaoRepository.findTop20ByTipoOrderByCreatedAtDesc(TipoMovimentacao.ENTRADA)
                .stream()
                .map(this::toMovimentacaoResponse)
                .collect(Collectors.toList());
    }

    private MovimentacaoEstoqueResponse toMovimentacaoResponse(MovimentacaoEstoque m) {
        return MovimentacaoEstoqueResponse.builder()
                .id(m.getId())
                .insumoId(m.getInsumo().getId())
                .insumoNome(m.getInsumo().getNome())
                .loteId(m.getLote() != null ? m.getLote().getId() : null)
                .loteNumero(m.getLote() != null ? m.getLote().getNumeroLote() : null)
                .tipo(m.getTipo())
                .quantidade(m.getQuantidade())
                .motivo(m.getMotivo())
                .origem(m.getOrigem())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
