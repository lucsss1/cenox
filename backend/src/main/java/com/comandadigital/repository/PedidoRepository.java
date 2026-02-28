package com.comandadigital.repository;

import com.comandadigital.entity.Pedido;
import com.comandadigital.enums.StatusPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Page<Pedido> findByClienteId(Long clienteId, Pageable pageable);

    Page<Pedido> findByStatusPedido(StatusPedido statusPedido, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.statusPedido = :status")
    long countByStatusPedido(@Param("status") StatusPedido status);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.statusPedido = 'ENTREGUE' AND p.createdAt BETWEEN :inicio AND :fim")
    BigDecimal faturamentoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.createdAt BETWEEN :inicio AND :fim")
    long countPedidosPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT p.statusPedido, COUNT(p) FROM Pedido p GROUP BY p.statusPedido")
    List<Object[]> countByStatusGroup();

    @Query("SELECT FUNCTION('DATE', p.createdAt), COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.statusPedido = 'ENTREGUE' AND p.createdAt BETWEEN :inicio AND :fim GROUP BY FUNCTION('DATE', p.createdAt) ORDER BY FUNCTION('DATE', p.createdAt)")
    List<Object[]> faturamentoDiario(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
