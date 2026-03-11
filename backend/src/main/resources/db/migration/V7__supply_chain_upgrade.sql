-- ============================================================
-- V7: Supply Chain Upgrade
-- Lot-based inventory, enhanced supplier lifecycle,
-- purchase suggestions, FIFO consumption
-- ============================================================

-- 1. Enhanced Supplier fields
ALTER TABLE fornecedores
    ADD COLUMN data_homologacao DATE NULL AFTER status_fornecedor,
    ADD COLUMN avaliacao DECIMAL(3,1) DEFAULT NULL AFTER data_homologacao,
    ADD COLUMN observacoes TEXT NULL AFTER avaliacao,
    ADD COLUMN prazo_entrega_dias INT DEFAULT NULL AFTER observacoes;

-- Update status_fornecedor to support full lifecycle
ALTER TABLE fornecedores MODIFY COLUMN status_fornecedor VARCHAR(20) NOT NULL DEFAULT 'EM_AVALIACAO';

-- 2. Enhanced Insumo fields
ALTER TABLE insumos
    ADD COLUMN estoque_ideal DECIMAL(10,3) DEFAULT 0.000 AFTER estoque_minimo,
    ADD COLUMN ultimo_custo_compra DECIMAL(10,2) DEFAULT NULL AFTER custo_medio,
    ADD COLUMN consumo_medio_diario DECIMAL(10,3) DEFAULT 0.000 AFTER ultimo_custo_compra;

-- 3. Lotes (Lot-based inventory)
CREATE TABLE lotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insumo_id BIGINT NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    quantidade_inicial DECIMAL(10,3) NOT NULL,
    data_validade DATE NULL,
    fornecedor_id BIGINT NULL,
    compra_id BIGINT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'ATIVO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lote_insumo FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    CONSTRAINT fk_lote_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    CONSTRAINT fk_lote_compra FOREIGN KEY (compra_id) REFERENCES compras(id),

    INDEX idx_lote_insumo (insumo_id),
    INDEX idx_lote_validade (data_validade),
    INDEX idx_lote_status (status),
    INDEX idx_lote_numero (numero_lote)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Enhanced Movimentacoes - add lot reference and source
ALTER TABLE movimentacoes_estoque
    ADD COLUMN lote_id BIGINT NULL AFTER insumo_id,
    ADD COLUMN origem VARCHAR(100) NULL AFTER motivo,
    MODIFY COLUMN tipo VARCHAR(20) NOT NULL;

ALTER TABLE movimentacoes_estoque
    ADD CONSTRAINT fk_movimentacao_lote FOREIGN KEY (lote_id) REFERENCES lotes(id);

CREATE INDEX idx_movimentacoes_lote ON movimentacoes_estoque(lote_id);

-- 5. Purchase suggestions table (for caching computed suggestions)
CREATE TABLE sugestoes_compra (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insumo_id BIGINT NOT NULL,
    fornecedor_id BIGINT NULL,
    quantidade_sugerida DECIMAL(10,3) NOT NULL,
    estoque_atual DECIMAL(10,3) NOT NULL,
    consumo_medio_diario DECIMAL(10,3) NOT NULL,
    dias_cobertura INT NOT NULL,
    prioridade VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_sugestao_insumo FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    CONSTRAINT fk_sugestao_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),

    INDEX idx_sugestao_insumo (insumo_id),
    INDEX idx_sugestao_status (status),
    INDEX idx_sugestao_prioridade (prioridade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
