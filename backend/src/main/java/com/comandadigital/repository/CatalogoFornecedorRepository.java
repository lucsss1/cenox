package com.comandadigital.repository;

import com.comandadigital.entity.CatalogoFornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatalogoFornecedorRepository extends JpaRepository<CatalogoFornecedor, Long> {

    List<CatalogoFornecedor> findByFornecedorId(Long fornecedorId);

    List<CatalogoFornecedor> findByInsumoIdOrderByPrecoAsc(Long insumoId);

    Optional<CatalogoFornecedor> findByFornecedorIdAndInsumoId(Long fornecedorId, Long insumoId);

    boolean existsByFornecedorIdAndInsumoId(Long fornecedorId, Long insumoId);
}
