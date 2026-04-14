package com.comandadigital.entity;

import com.comandadigital.enums.StatusGeral;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fichas_tecnicas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FichaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prato_id", nullable = false, unique = true)
    private Prato prato;

    @Column(nullable = false)
    private Integer rendimento;

    @Column(name = "custo_total", precision = 10, scale = 2)
    private BigDecimal custoTotal;

    @Column(name = "custo_por_porcao", precision = 10, scale = 2)
    private BigDecimal custoPorPorcao;

    @OneToMany(mappedBy = "fichaTecnica", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemFichaTecnica> itens = new ArrayList<>();

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
}
