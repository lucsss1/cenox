package com.comandadigital.repository;

import com.comandadigital.entity.MovimentacaoEstoque;
import com.comandadigital.enums.TipoMovimentacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {

    Page<MovimentacaoEstoque> findByInsumoId(Long insumoId, Pageable pageable);

    List<MovimentacaoEstoque> findTop20ByTipoOrderByCreatedAtDesc(TipoMovimentacao tipo);
}
