package com.comandadigital.repository;

import com.comandadigital.entity.Compra;
import com.comandadigital.enums.StatusCompra;
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

    Page<Compra> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Compra> findByStatus(StatusCompra status, Pageable pageable);

    Page<Compra> findByFornecedorIdAndStatus(Long fornecedorId, StatusCompra status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(c.valorTotal), 0) FROM Compra c WHERE c.status = 'RECEBIDO' AND c.dataCompra BETWEEN :inicio AND :fim")
    BigDecimal totalComprasPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
