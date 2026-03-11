package com.comandadigital.repository;

import com.comandadigital.entity.SugestaoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SugestaoCompraRepository extends JpaRepository<SugestaoCompra, Long> {

    List<SugestaoCompra> findByStatusOrderByPrioridadeAsc(String status);

    void deleteByStatus(String status);
}
