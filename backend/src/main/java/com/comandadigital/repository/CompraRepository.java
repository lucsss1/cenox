package com.comandadigital.repository;

import com.comandadigital.entity.Compra;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    Page<Compra> findByStatus(StatusGeral status, Pageable pageable);

    Page<Compra> findByFornecedorIdAndStatus(Long fornecedorId, StatusGeral status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(c.valorTotal), 0) FROM Compra c WHERE c.status = 'ATIVO' AND c.dataCompra BETWEEN :inicio AND :fim")
    BigDecimal totalComprasPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
