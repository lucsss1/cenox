package com.comandadigital.mapper;

import com.comandadigital.dto.request.InsumoRequest;
import com.comandadigital.dto.response.InsumoResponse;
import com.comandadigital.entity.Insumo;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class InsumoMapper {

    public InsumoResponse toResponse(Insumo entity) {
        boolean abaixoMinimo = entity.getQuantidadeEstoque().compareTo(entity.getEstoqueMinimo()) <= 0;
        String nivelEstoque = calcularNivelEstoque(entity);

        return InsumoResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .unidadeMedida(entity.getUnidadeMedida())
                .quantidadeEstoque(entity.getQuantidadeEstoque())
                .estoqueMinimo(entity.getEstoqueMinimo())
                .estoqueIdeal(entity.getEstoqueIdeal())
                .custoMedio(entity.getCustoMedio())
                .ultimoCustoCompra(entity.getUltimoCustoCompra())
                .consumoMedioDiario(entity.getConsumoMedioDiario())
                .abaixoEstoqueMinimo(abaixoMinimo)
                .nivelEstoque(nivelEstoque)
                .categoria(entity.getCategoria())
                .dataEntradaEstoque(entity.getDataEntradaEstoque())
                .dataValidade(entity.getDataValidade())
                .fornecedorId(entity.getFornecedor() != null ? entity.getFornecedor().getId() : null)
                .fornecedorNome(entity.getFornecedor() != null ? entity.getFornecedor().getNomeEmpresa() : null)
                .status(entity.getStatus())
                .build();
    }

    public Insumo toEntity(InsumoRequest request) {
        return Insumo.builder()
                .nome(request.getNome())
                .unidadeMedida(request.getUnidadeMedida())
                .estoqueMinimo(request.getEstoqueMinimo())
                .estoqueIdeal(request.getEstoqueIdeal())
                .custoMedio(request.getCustoMedio())
                .categoria(request.getCategoria())
                .dataEntradaEstoque(request.getDataEntradaEstoque())
                .dataValidade(request.getDataValidade())
                .build();
    }

    private String calcularNivelEstoque(Insumo entity) {
        BigDecimal estoque = entity.getQuantidadeEstoque();
        BigDecimal minimo = entity.getEstoqueMinimo();

        if (estoque.compareTo(BigDecimal.ZERO) == 0) {
            return "SEM_ESTOQUE";
        }

        BigDecimal limiteCritico = minimo.multiply(new BigDecimal("0.5"));
        if (estoque.compareTo(limiteCritico) <= 0) {
            return "CRITICO";
        }
        if (estoque.compareTo(minimo) <= 0) {
            return "BAIXO";
        }

        BigDecimal estoqueIdeal = entity.getEstoqueIdeal();
        if (estoqueIdeal != null && estoqueIdeal.compareTo(BigDecimal.ZERO) > 0
                && estoque.compareTo(estoqueIdeal) >= 0) {
            return "IDEAL";
        }

        return "NORMAL";
    }
}
