package com.comandadigital.entity;

import com.comandadigital.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "catalogo_fornecedor",
        uniqueConstraints = @UniqueConstraint(columnNames = {"fornecedor_id", "insumo_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CatalogoFornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private Insumo insumo;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_venda", nullable = false, length = 5)
    private UnidadeMedida unidadeVenda;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
