package com.comandadigital.service;

import com.comandadigital.dto.response.MovimentacaoEstoqueResponse;
import com.comandadigital.entity.Insumo;
import com.comandadigital.entity.MovimentacaoEstoque;
import com.comandadigital.enums.MotivoSaida;
import com.comandadigital.enums.TipoMovimentacao;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.repository.InsumoRepository;
import com.comandadigital.repository.MovimentacaoEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final InsumoRepository insumoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    @Transactional
    public void registrarEntrada(Insumo insumo, BigDecimal quantidade, String motivo) {
        insumo.setQuantidadeEstoque(insumo.getQuantidadeEstoque().add(quantidade));
        insumoRepository.save(insumo);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .insumo(insumo)
                .tipo(TipoMovimentacao.ENTRADA)
                .quantidade(quantidade)
                .motivo(motivo)
                .build();
        movimentacaoRepository.save(movimentacao);
    }

    @Transactional
    public void registrarSaida(Insumo insumo, BigDecimal quantidade, String motivo) {
        if (insumo.getQuantidadeEstoque().compareTo(quantidade) < 0) {
            throw new BusinessException(
                    "Estoque insuficiente para o insumo: " + insumo.getNome() +
                    ". Disponivel: " + insumo.getQuantidadeEstoque() +
                    ", Solicitado: " + quantidade
            );
        }

        insumo.setQuantidadeEstoque(insumo.getQuantidadeEstoque().subtract(quantidade));
        insumoRepository.save(insumo);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .insumo(insumo)
                .tipo(TipoMovimentacao.SAIDA)
                .quantidade(quantidade)
                .motivo(motivo)
                .build();
        movimentacaoRepository.save(movimentacao);
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
                .build();
        movimentacaoRepository.save(movimentacao);
    }

    @Transactional
    public void registrarSaidaManual(Insumo insumo, BigDecimal quantidade, MotivoSaida motivoSaida) {
        if (insumo.getQuantidadeEstoque().compareTo(quantidade) < 0) {
            throw new BusinessException(
                    "Estoque insuficiente para o insumo: " + insumo.getNome() +
                    ". Disponivel: " + insumo.getQuantidadeEstoque() +
                    ", Solicitado: " + quantidade
            );
        }

        insumo.setQuantidadeEstoque(insumo.getQuantidadeEstoque().subtract(quantidade));
        insumoRepository.save(insumo);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .insumo(insumo)
                .tipo(TipoMovimentacao.SAIDA)
                .quantidade(quantidade)
                .motivo("Saida manual - " + motivoSaida.name())
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
                .map(m -> MovimentacaoEstoqueResponse.builder()
                        .id(m.getId())
                        .insumoId(m.getInsumo().getId())
                        .insumoNome(m.getInsumo().getNome())
                        .tipo(m.getTipo())
                        .quantidade(m.getQuantidade())
                        .motivo(m.getMotivo())
                        .createdAt(m.getCreatedAt())
                        .build());
    }
}
