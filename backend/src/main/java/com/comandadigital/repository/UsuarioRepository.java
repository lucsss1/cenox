package com.comandadigital.repository;

import com.comandadigital.entity.Usuario;
import com.comandadigital.enums.Perfil;
import com.comandadigital.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailAndStatus(String email, StatusGeral status);

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<Usuario> findByStatus(StatusGeral status, Pageable pageable);

    Page<Usuario> findByPerfilAndStatus(Perfil perfil, StatusGeral status, Pageable pageable);

    long countByPerfilAndStatus(Perfil perfil, StatusGeral status);
}
