package com.comandadigital.entity;

import com.comandadigital.enums.StatusGeral;
import com.comandadigital.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    @Column(name = "estoque_ideal", precision = 10, scale = 3)
    private BigDecimal estoqueIdeal;

    @Column(name = "custo_medio", precision = 10, scale = 2)
    private BigDecimal custoMedio;

    @Column(name = "ultimo_custo_compra", precision = 10, scale = 2)
    private BigDecimal ultimoCustoCompra;

    @Column(name = "consumo_medio_diario", precision = 10, scale = 3)
    private BigDecimal consumoMedioDiario;

    @Column(length = 100)
    private String categoria;

    @Column(name = "data_entrada_estoque")
    private LocalDate dataEntradaEstoque;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

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
        if (this.estoqueIdeal == null) this.estoqueIdeal = BigDecimal.ZERO;
        if (this.consumoMedioDiario == null) this.consumoMedioDiario = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isAbaixoEstoqueMinimo() {
        return this.quantidadeEstoque.compareTo(this.estoqueMinimo) <= 0;
    }

    public boolean isEstoqueCritico() {
        BigDecimal limitesCritico = this.estoqueMinimo.multiply(new BigDecimal("0.5"));
        return this.quantidadeEstoque.compareTo(limitesCritico) <= 0;
    }
}
