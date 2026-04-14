package com.comandadigital.repository;

import com.comandadigital.entity.Prato;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PratoRepository extends JpaRepository<Prato, Long> {

    Page<Prato> findByStatus(StatusGeral status, Pageable pageable);

    Page<Prato> findByCategoriaIdAndStatus(Long categoriaId, StatusGeral status, Pageable pageable);

    @Query("SELECT p FROM Prato p WHERE p.status = :status AND p.fichaTecnica IS NOT NULL")
    Page<Prato> findAtivosComFichaTecnica(@Param("status") StatusGeral status, Pageable pageable);

    @Query("SELECT p FROM Prato p WHERE p.foodCost > :limite AND p.status = 'ATIVO'")
    List<Prato> findPratosComFoodCostAlto(@Param("limite") BigDecimal limite);

    long countByStatus(StatusGeral status);
}
