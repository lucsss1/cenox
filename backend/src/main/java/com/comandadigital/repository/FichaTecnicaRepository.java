package com.comandadigital.repository;

import com.comandadigital.entity.FichaTecnica;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FichaTecnicaRepository extends JpaRepository<FichaTecnica, Long> {

    Optional<FichaTecnica> findByPratoId(Long pratoId);

    boolean existsByPratoIdAndStatus(Long pratoId, StatusGeral status);

    Page<FichaTecnica> findByStatus(StatusGeral status, Pageable pageable);
}
