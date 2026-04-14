package com.comandadigital.repository;

import com.comandadigital.entity.Insumo;
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
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    Page<Insumo> findByStatus(StatusGeral status, Pageable pageable);

    List<Insumo> findAllByStatus(StatusGeral status);

    @Query("SELECT i FROM Insumo i WHERE i.quantidadeEstoque <= i.estoqueMinimo AND i.status = 'ATIVO'")
    List<Insumo> findInsumosAbaixoEstoqueMinimo();

    long countByStatus(StatusGeral status);

    @Query("SELECT i FROM Insumo i WHERE i.dataValidade IS NOT NULL AND i.dataValidade < :data AND i.status = 'ATIVO' ORDER BY i.dataValidade ASC")
    List<Insumo> findVencidos(@Param("data") LocalDate data);

    @Query("SELECT i FROM Insumo i WHERE i.dataValidade IS NOT NULL AND i.dataValidade >= :hoje AND i.dataValidade <= :limite AND i.status = 'ATIVO' ORDER BY i.dataValidade ASC")
    List<Insumo> findProximosVencimento(@Param("hoje") LocalDate hoje, @Param("limite") LocalDate limite);

    @Query("SELECT i FROM Insumo i WHERE i.dataValidade IS NOT NULL AND i.status = 'ATIVO' ORDER BY i.dataValidade ASC")
    List<Insumo> findAllOrdenadoPorValidade();
}
