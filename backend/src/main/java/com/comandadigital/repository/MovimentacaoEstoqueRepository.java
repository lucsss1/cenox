package com.comandadigital.repository;

import com.comandadigital.entity.MovimentacaoEstoque;
import com.comandadigital.enums.TipoMovimentacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {

    Page<MovimentacaoEstoque> findByInsumoId(Long insumoId, Pageable pageable);

    List<MovimentacaoEstoque> findTop20ByTipoOrderByCreatedAtDesc(TipoMovimentacao tipo);

    @Query(value = "SELECT me.insumo_id, i.nome, SUM(me.quantidade) as total, i.unidade_medida " +
                   "FROM movimentacoes_estoque me JOIN insumos i ON me.insumo_id = i.id " +
                   "WHERE me.tipo = 'SAIDA' AND me.created_at BETWEEN :inicio AND :fim " +
                   "GROUP BY me.insumo_id, i.nome, i.unidade_medida ORDER BY total DESC LIMIT 10",
           nativeQuery = true)
    List<Object[]> findIngredientesMaisUsados(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
