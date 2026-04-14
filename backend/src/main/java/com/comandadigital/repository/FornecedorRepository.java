package com.comandadigital.repository;

import com.comandadigital.entity.Fornecedor;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {

    boolean existsByCnpj(String cnpj);

    Page<Fornecedor> findByStatus(StatusGeral status, Pageable pageable);

    List<Fornecedor> findAllByStatus(StatusGeral status);
}
