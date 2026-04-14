package com.comandadigital.repository;

import com.comandadigital.entity.Categoria;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Page<Categoria> findByStatus(StatusGeral status, Pageable pageable);

    List<Categoria> findAllByStatus(StatusGeral status);
}
