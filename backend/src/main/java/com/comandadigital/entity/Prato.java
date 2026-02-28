package com.comandadigital.entity;

import com.comandadigital.enums.StatusGeral;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pratos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Prato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "preco_venda", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoVenda;

    @Column(name = "custo_producao", precision = 10, scale = 2)
    private BigDecimal custoProducao;

    @Column(name = "food_cost", precision = 5, scale = 2)
    private BigDecimal foodCost;

    @Column(name = "tempo_preparo")
    private Integer tempoPreparo;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @OneToOne(mappedBy = "prato", fetch = FetchType.LAZY)
    private FichaTecnica fichaTecnica;

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
        if (this.status == null) this.status = StatusGeral.INATIVO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean temFichaTecnica() {
        return this.fichaTecnica != null;
    }
}
