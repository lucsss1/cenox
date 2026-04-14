package com.comandadigital.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_ficha_tecnica")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ItemFichaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ficha_tecnica_id", nullable = false)
    private FichaTecnica fichaTecnica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private Insumo insumo;

    @Column(name = "quantidade_bruta", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidadeBruta;

    @Column(name = "fator_correcao", nullable = false, precision = 5, scale = 2)
    private BigDecimal fatorCorrecao;

    @Column(name = "quantidade_liquida", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidadeLiquida;

    @Column(name = "custo_item", precision = 10, scale = 2)
    private BigDecimal custoItem;
}
