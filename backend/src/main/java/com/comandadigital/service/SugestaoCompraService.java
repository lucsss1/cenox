package com.comandadigital.service;

import com.comandadigital.dto.response.SugestaoCompraResponse;
import com.comandadigital.entity.Insumo;
import com.comandadigital.entity.SugestaoCompra;
import com.comandadigital.enums.PrioridadeSugestao;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.repository.InsumoRepository;
import com.comandadigital.repository.MovimentacaoEstoqueRepository;
import com.comandadigital.repository.SugestaoCompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SugestaoCompraService {

    private final SugestaoCompraRepository repository;
    private final InsumoRepository insumoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    private static final int DIAS_SEGURANCA = 3;

    /**
     * Calcula sugestoes de compra baseado em:
     * - Consumo medio diario
     * - Prazo de entrega do fornecedor (lead time)
     * - Estoque de seguranca
     * - Estoque ideal vs estoque atual
     *
     * Formula: Qtd Sugerida = (Consumo Medio Diario * (Lead Time + Seguranca)) + Estoque Minimo - Estoque Atual
     * Se estoqueIdeal > 0: Qtd Sugerida = max(formula, estoqueIdeal - estoqueAtual)
     */
    @Transactional
    public List<SugestaoCompraResponse> calcularSugestoes() {
        // Limpar sugestoes pendentes antigas
        repository.deleteByStatus("PENDENTE");

        List<Insumo> insumos = insumoRepository.findAllByStatus(StatusGeral.ATIVO);
        List<SugestaoCompra> sugestoes = new ArrayList<>();

        for (Insumo insumo : insumos) {
            BigDecimal estoqueAtual = insumo.getQuantidadeEstoque();
            BigDecimal estoqueMinimo = insumo.getEstoqueMinimo();
            BigDecimal consumoDiario = insumo.getConsumoMedioDiario() != null
                    ? insumo.getConsumoMedioDiario() : BigDecimal.ZERO;

            // Pular insumos sem consumo e com estoque acima do minimo
            if (consumoDiario.compareTo(BigDecimal.ZERO) == 0
                    && estoqueAtual.compareTo(estoqueMinimo) > 0) {
                continue;
            }

            // Calcular lead time do fornecedor
            int leadTime = 0;
            if (insumo.getFornecedor() != null && insumo.getFornecedor().getPrazoEntregaDias() != null) {
                leadTime = insumo.getFornecedor().getPrazoEntregaDias();
            }

            // Calcular dias de cobertura atuais
            int diasCobertura = 0;
            if (consumoDiario.compareTo(BigDecimal.ZERO) > 0) {
                diasCobertura = estoqueAtual.divide(consumoDiario, 0, RoundingMode.FLOOR).intValue();
            }

            // Calcular quantidade sugerida
            BigDecimal consumoPeriodo = consumoDiario.multiply(
                    new BigDecimal(leadTime + DIAS_SEGURANCA));
            BigDecimal pontoReposicao = consumoPeriodo.add(estoqueMinimo);
            BigDecimal qtdSugerida = pontoReposicao.subtract(estoqueAtual);

            // Se tiver estoque ideal, usar como referencia
            BigDecimal estoqueIdeal = insumo.getEstoqueIdeal();
            if (estoqueIdeal != null && estoqueIdeal.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal qtdParaIdeal = estoqueIdeal.subtract(estoqueAtual);
                if (qtdParaIdeal.compareTo(qtdSugerida) > 0) {
                    qtdSugerida = qtdParaIdeal;
                }
            }

            // Se a quantidade sugerida for <= 0, nao precisa comprar
            if (qtdSugerida.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            // Calcular prioridade
            PrioridadeSugestao prioridade = calcularPrioridade(insumo, diasCobertura, leadTime);

            SugestaoCompra sugestao = SugestaoCompra.builder()
                    .insumo(insumo)
                    .fornecedor(insumo.getFornecedor())
                    .quantidadeSugerida(qtdSugerida.setScale(3, RoundingMode.HALF_UP))
                    .estoqueAtual(estoqueAtual)
                    .consumoMedioDiario(consumoDiario)
                    .diasCobertura(diasCobertura)
                    .prioridade(prioridade)
                    .status("PENDENTE")
                    .build();

            sugestoes.add(sugestao);
        }

        repository.saveAll(sugestoes);

        return sugestoes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SugestaoCompraResponse> listarSugestoesPendentes() {
        return repository.findByStatusOrderByPrioridadeAsc("PENDENTE").stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PrioridadeSugestao calcularPrioridade(Insumo insumo, int diasCobertura, int leadTime) {
        BigDecimal estoque = insumo.getQuantidadeEstoque();

        // Sem estoque: critico
        if (estoque.compareTo(BigDecimal.ZERO) == 0) {
            return PrioridadeSugestao.CRITICA;
        }

        // Estoque nao cobre o lead time: alta
        if (diasCobertura <= leadTime) {
            return PrioridadeSugestao.ALTA;
        }

        // Abaixo do minimo: alta
        if (insumo.isAbaixoEstoqueMinimo()) {
            return PrioridadeSugestao.ALTA;
        }

        // Estoque cobre ate 2x lead time: media
        if (diasCobertura <= leadTime * 2) {
            return PrioridadeSugestao.MEDIA;
        }

        return PrioridadeSugestao.BAIXA;
    }

    private SugestaoCompraResponse toResponse(SugestaoCompra s) {
        BigDecimal custoEstimado = BigDecimal.ZERO;
        if (s.getInsumo().getCustoMedio() != null) {
            custoEstimado = s.getQuantidadeSugerida().multiply(s.getInsumo().getCustoMedio())
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return SugestaoCompraResponse.builder()
                .id(s.getId())
                .insumoId(s.getInsumo().getId())
                .insumoNome(s.getInsumo().getNome())
                .unidadeMedida(s.getInsumo().getUnidadeMedida().name())
                .fornecedorId(s.getFornecedor() != null ? s.getFornecedor().getId() : null)
                .fornecedorNome(s.getFornecedor() != null ? s.getFornecedor().getNomeEmpresa() : null)
                .quantidadeSugerida(s.getQuantidadeSugerida())
                .estoqueAtual(s.getEstoqueAtual())
                .estoqueMinimo(s.getInsumo().getEstoqueMinimo())
                .estoqueIdeal(s.getInsumo().getEstoqueIdeal())
                .consumoMedioDiario(s.getConsumoMedioDiario())
                .diasCobertura(s.getDiasCobertura())
                .prioridade(s.getPrioridade())
                .status(s.getStatus())
                .custoEstimado(custoEstimado)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
