package com.comandadigital.entity;

import com.comandadigital.enums.StatusGeral;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lotes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private Insumo insumo;

    @Column(name = "numero_lote", nullable = false, length = 50)
    private String numeroLote;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidade;

    @Column(name = "quantidade_inicial", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidadeInicial;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id")
    private Compra compra;

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
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isVencido() {
        return this.dataValidade != null && this.dataValidade.isBefore(LocalDate.now());
    }

    public boolean isProximoVencimento(int dias) {
        if (this.dataValidade == null) return false;
        LocalDate limite = LocalDate.now().plusDays(dias);
        return !this.dataValidade.isBefore(LocalDate.now()) && this.dataValidade.isBefore(limite);
    }

    public boolean temEstoqueDisponivel() {
        return this.quantidade.compareTo(BigDecimal.ZERO) > 0
                && this.status == StatusGeral.ATIVO;
    }
}
