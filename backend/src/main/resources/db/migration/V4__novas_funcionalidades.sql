-- V4: Novas funcionalidades
-- 1. Cancelamento com estorno: motivo obrigatorio no pedido
ALTER TABLE pedidos ADD COLUMN motivo_cancelamento VARCHAR(255) NULL;

-- 2. Suporte a ESTORNO no tipo de movimentacao
ALTER TABLE movimentacoes_estoque MODIFY COLUMN tipo VARCHAR(20) NOT NULL;

-- 3. Catalogo de fornecedor: vinculo insumo-fornecedor com preco e unidade
CREATE TABLE catalogo_fornecedor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fornecedor_id BIGINT NOT NULL,
    insumo_id BIGINT NOT NULL,
    preco DECIMAL(10,4) NOT NULL,
    unidade_venda VARCHAR(5) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    UNIQUE KEY uk_catalogo_forn_insumo (fornecedor_id, insumo_id),
    INDEX idx_catalogo_insumo (insumo_id),
    INDEX idx_catalogo_fornecedor (fornecedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Historico de precos por insumo/fornecedor
CREATE TABLE historico_precos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insumo_id BIGINT NOT NULL,
    fornecedor_id BIGINT NOT NULL,
    preco DECIMAL(10,4) NOT NULL,
    data_registro DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    INDEX idx_hist_insumo (insumo_id),
    INDEX idx_hist_fornecedor (fornecedor_id),
    INDEX idx_hist_data (data_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pedido de compra com status workflow: alterar coluna status
ALTER TABLE compras MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO';
UPDATE compras SET status = 'RECEBIDO' WHERE status = 'ATIVO';
UPDATE compras SET status = 'CANCELADO' WHERE status = 'INATIVO';
