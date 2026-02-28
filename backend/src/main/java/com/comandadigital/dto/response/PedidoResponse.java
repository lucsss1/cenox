package com.comandadigital.dto.response;

import com.comandadigital.enums.StatusPedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoResponse {
    private Long id;
    private Long clienteId;
    private String clienteNome;
    private StatusPedido statusPedido;
    private BigDecimal total;
    private String observacao;
    private List<ItemPedidoResponse> itens;
    private LocalDateTime createdAt;
}
