package com.comandadigital.service;

import com.comandadigital.dto.request.FichaTecnicaRequest;
import com.comandadigital.dto.request.ItemFichaTecnicaRequest;
import com.comandadigital.dto.response.FichaTecnicaResponse;
import com.comandadigital.entity.FichaTecnica;
import com.comandadigital.entity.Insumo;
import com.comandadigital.entity.ItemFichaTecnica;
import com.comandadigital.entity.Prato;
import com.comandadigital.enums.StatusGeral;
import com.comandadigital.exception.BusinessException;
import com.comandadigital.exception.ResourceNotFoundException;
import com.comandadigital.mapper.FichaTecnicaMapper;
import com.comandadigital.repository.FichaTecnicaRepository;
import com.comandadigital.repository.PratoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FichaTecnicaService {

    private final FichaTecnicaRepository repository;
    private final PratoRepository pratoRepository;
    private final PratoService pratoService;
    private final InsumoService insumoService;
    private final FichaTecnicaMapper mapper;

    @Transactional(readOnly = true)
    public Page<FichaTecnicaResponse> listar(Pageable pageable) {
        return repository.findByStatus(StatusGeral.ATIVO, pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public FichaTecnicaResponse buscarPorId(Long id) {
        FichaTecnica ficha = findActiveById(id);
        return mapper.toResponse(ficha);
    }

    @Transactional(readOnly = true)
    public FichaTecnicaResponse buscarPorPrato(Long pratoId) {
        FichaTecnica ficha = repository.findByPratoId(pratoId)
                .orElseThrow(() -> new ResourceNotFoundException("Ficha tecnica nao encontrada para o prato: " + pratoId));
        return mapper.toResponse(ficha);
    }

    @Transactional
    public FichaTecnicaResponse criar(FichaTecnicaRequest request) {
        if (repository.existsByPratoIdAndStatus(request.getPratoId(), StatusGeral.ATIVO)) {
            throw new BusinessException("Ja existe ficha tecnica para este prato");
        }

        // Remover ficha INATIVA antiga se existir (constraint UNIQUE em prato_id)
        repository.findByPratoId(request.getPratoId())
                .filter(f -> f.getStatus() == StatusGeral.INATIVO)
                .ifPresent(f -> {
                    repository.delete(f);
                    repository.flush();
                });

        Prato prato = pratoService.findActiveOrInactiveById(request.getPratoId());

        FichaTecnica ficha = FichaTecnica.builder()
                .prato(prato)
                .rendimento(request.getRendimento())
                .itens(new ArrayList<>())
                .build();

        List<ItemFichaTecnica> itens = processarItens(request.getItens(), ficha);
        ficha.setItens(itens);

        calcularCustos(ficha);

        ficha = repository.save(ficha);

        // Atualizar custo producao e food cost do prato
        atualizarCustoPrato(prato, ficha);

        return mapper.toResponse(ficha);
    }

    @Transactional
    public FichaTecnicaResponse atualizar(Long id, FichaTecnicaRequest request) {
        FichaTecnica ficha = findActiveById(id);
        Prato prato = pratoService.findActiveOrInactiveById(request.getPratoId());

        ficha.setPrato(prato);
        ficha.setRendimento(request.getRendimento());
        ficha.getItens().clear();

        List<ItemFichaTecnica> itens = processarItens(request.getItens(), ficha);
        ficha.getItens().addAll(itens);

        calcularCustos(ficha);

        ficha = repository.save(ficha);

        // Atualizar custo producao e food cost do prato
        atualizarCustoPrato(prato, ficha);

        return mapper.toResponse(ficha);
    }

    @Transactional
    public void desativar(Long id) {
        FichaTecnica ficha = findActiveById(id);
        ficha.setStatus(StatusGeral.INATIVO);
        repository.save(ficha);

        // Desativar prato e limpar custos (regra: prato so ATIVO com ficha tecnica)
        Prato prato = ficha.getPrato();
        prato.setStatus(StatusGeral.INATIVO);
        prato.setCustoProducao(null);
        prato.setFoodCost(null);
        pratoRepository.save(prato);
    }

    /**
     * Recalcula custos de todas fichas tecnicas que usam determinado insumo.
     * Chamado quando o custo medio de um insumo e atualizado.
     */
    @Transactional
    public void recalcularFichasComInsumo(Long insumoId) {
        List<FichaTecnica> fichas = repository.findAll().stream()
                .filter(f -> f.getStatus() == StatusGeral.ATIVO)
                .filter(f -> f.getItens().stream()
                        .anyMatch(i -> i.getInsumo().getId().equals(insumoId)))
                .toList();

        for (FichaTecnica ficha : fichas) {
            recalcularCustosItens(ficha);
            calcularCustos(ficha);
            repository.save(ficha);
            atualizarCustoPrato(ficha.getPrato(), ficha);
        }
    }

    private List<ItemFichaTecnica> processarItens(List<ItemFichaTecnicaRequest> requests, FichaTecnica ficha) {
        List<ItemFichaTecnica> itens = new ArrayList<>();

        for (ItemFichaTecnicaRequest itemReq : requests) {
            if (itemReq.getFatorCorrecao().compareTo(BigDecimal.ONE) < 0) {
                throw new BusinessException("Fator de correcao deve ser >= 1.0");
            }

            Insumo insumo = insumoService.findActiveById(itemReq.getInsumoId());

            // quantidadeLiquida = quantidadeBruta / fatorCorrecao
            BigDecimal quantidadeLiquida = itemReq.getQuantidadeBruta()
                    .divide(itemReq.getFatorCorrecao(), 3, RoundingMode.HALF_UP);

            // custoItem = quantidadeBruta * custoMedio
            BigDecimal custoItem = BigDecimal.ZERO;
            if (insumo.getCustoMedio() != null) {
                custoItem = itemReq.getQuantidadeBruta().multiply(insumo.getCustoMedio())
                        .setScale(2, RoundingMode.HALF_UP);
            }

            ItemFichaTecnica item = ItemFichaTecnica.builder()
                    .fichaTecnica(ficha)
                    .insumo(insumo)
                    .quantidadeBruta(itemReq.getQuantidadeBruta())
                    .fatorCorrecao(itemReq.getFatorCorrecao())
                    .quantidadeLiquida(quantidadeLiquida)
                    .custoItem(custoItem)
                    .build();

            itens.add(item);
        }

        return itens;
    }

    private void recalcularCustosItens(FichaTecnica ficha) {
        for (ItemFichaTecnica item : ficha.getItens()) {
            BigDecimal custoItem = BigDecimal.ZERO;
            if (item.getInsumo().getCustoMedio() != null) {
                custoItem = item.getQuantidadeBruta().multiply(item.getInsumo().getCustoMedio())
                        .setScale(2, RoundingMode.HALF_UP);
            }
            item.setCustoItem(custoItem);
        }
    }

    private void calcularCustos(FichaTecnica ficha) {
        // custoTotal = soma de todos custoItem
        BigDecimal custoTotal = ficha.getItens().stream()
                .map(ItemFichaTecnica::getCustoItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ficha.setCustoTotal(custoTotal);

        // custoPorPorcao = custoTotal / rendimento
        if (ficha.getRendimento() != null && ficha.getRendimento() > 0) {
            ficha.setCustoPorPorcao(
                    custoTotal.divide(new BigDecimal(ficha.getRendimento()), 2, RoundingMode.HALF_UP)
            );
        }
    }

    private void atualizarCustoPrato(Prato prato, FichaTecnica ficha) {
        prato.setCustoProducao(ficha.getCustoPorPorcao());

        // foodCost = (custoProducao / precoVenda) * 100
        if (prato.getPrecoVenda() != null && prato.getPrecoVenda().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal foodCost = ficha.getCustoPorPorcao()
                    .divide(prato.getPrecoVenda(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
            prato.setFoodCost(foodCost);
        }

        pratoRepository.save(prato);
    }

    public FichaTecnica findActiveById(Long id) {
        return repository.findById(id)
                .filter(f -> f.getStatus() == StatusGeral.ATIVO)
                .orElseThrow(() -> new ResourceNotFoundException("Ficha tecnica nao encontrada: " + id));
    }
}
