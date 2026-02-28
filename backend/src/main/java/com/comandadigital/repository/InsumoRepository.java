package com.comandadigital.repository;

import com.comandadigital.entity.Insumo;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    Page<Insumo> findByStatus(StatusGeral status, Pageable pageable);

    @Query("SELECT i FROM Insumo i WHERE i.quantidadeEstoque <= i.estoqueMinimo AND i.status = 'ATIVO'")
    List<Insumo> findInsumosAbaixoEstoqueMinimo();

    long countByStatus(StatusGeral status);
}
