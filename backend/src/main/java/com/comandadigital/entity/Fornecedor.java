package com.comandadigital.entity;

import com.comandadigital.enums.StatusFornecedor;
import com.comandadigital.enums.StatusGeral;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fornecedores")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_empresa", nullable = false, length = 200)
    private String nomeEmpresa;

    @Column(name = "razao_social", length = 200)
    private String razaoSocial;

    @Column(nullable = false, unique = true, length = 18)
    private String cnpj;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(length = 255)
    private String endereco;

    @Column(name = "responsavel_comercial", length = 150)
    private String responsavelComercial;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_fornecedor", nullable = false, length = 20)
    private StatusFornecedor statusFornecedor;

    @Column(name = "data_homologacao")
    private LocalDate dataHomologacao;

    @Column(precision = 3, scale = 1)
    private BigDecimal avaliacao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "prazo_entrega_dias")
    private Integer prazoEntregaDias;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StatusGeral status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = StatusGeral.ATIVO;
        if (this.statusFornecedor == null) this.statusFornecedor = StatusFornecedor.EM_AVALIACAO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isHomologado() {
        return this.statusFornecedor == StatusFornecedor.HOMOLOGADO;
    }
}
