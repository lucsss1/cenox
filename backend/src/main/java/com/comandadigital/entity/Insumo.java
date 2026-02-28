package com.comandadigital.entity;

import com.comandadigital.enums.StatusGeral;
import com.comandadigital.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "insumos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_medida", nullable = false, length = 5)
    private UnidadeMedida unidadeMedida;

    @Column(name = "quantidade_estoque", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidadeEstoque;

    @Column(name = "estoque_minimo", nullable = false, precision = 10, scale = 3)
    private BigDecimal estoqueMinimo;

    @Column(name = "custo_medio", precision = 10, scale = 2)
    private BigDecimal custoMedio;

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
        if (this.quantidadeEstoque == null) this.quantidadeEstoque = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
