package com.comandadigital.repository;

import com.comandadigital.entity.Lote;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    Page<Lote> findByInsumoIdAndStatusOrderByDataValidadeAsc(Long insumoId, StatusGeral status, Pageable pageable);

    List<Lote> findByInsumoIdAndStatusOrderByDataValidadeAsc(Long insumoId, StatusGeral status);

    @Query("SELECT l FROM Lote l WHERE l.insumo.id = :insumoId AND l.status = 'ATIVO' AND l.quantidade > 0 ORDER BY l.dataValidade ASC NULLS LAST, l.createdAt ASC")
    List<Lote> findLotesDisponiveisFIFO(@Param("insumoId") Long insumoId);

    @Query("SELECT l FROM Lote l WHERE l.dataValidade IS NOT NULL AND l.dataValidade < :data AND l.status = 'ATIVO' AND l.quantidade > 0 ORDER BY l.dataValidade ASC")
    List<Lote> findLotesVencidos(@Param("data") LocalDate data);

    @Query("SELECT l FROM Lote l WHERE l.dataValidade IS NOT NULL AND l.dataValidade >= :hoje AND l.dataValidade <= :limite AND l.status = 'ATIVO' AND l.quantidade > 0 ORDER BY l.dataValidade ASC")
    List<Lote> findLotesProximosVencimento(@Param("hoje") LocalDate hoje, @Param("limite") LocalDate limite);

    @Query("SELECT l FROM Lote l WHERE l.status = 'ATIVO' AND l.quantidade > 0 ORDER BY l.dataValidade ASC NULLS LAST")
    List<Lote> findAllLotesAtivosOrdenadoPorValidade();

    Page<Lote> findByStatusOrderByDataValidadeAsc(StatusGeral status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(l.quantidade), 0) FROM Lote l WHERE l.insumo.id = :insumoId AND l.status = 'ATIVO'")
    java.math.BigDecimal somaEstoquePorInsumo(@Param("insumoId") Long insumoId);

    List<Lote> findByCompraId(Long compraId);
}
