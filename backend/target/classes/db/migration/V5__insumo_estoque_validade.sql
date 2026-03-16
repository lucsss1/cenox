-- V5: Adicionar campos de controle de estoque e validade ao insumo
ALTER TABLE insumos ADD COLUMN categoria VARCHAR(100) NULL;
ALTER TABLE insumos ADD COLUMN data_entrada_estoque DATE NULL;
ALTER TABLE insumos ADD COLUMN data_validade DATE NULL;
ALTER TABLE insumos ADD COLUMN fornecedor_id BIGINT NULL;

ALTER TABLE insumos ADD CONSTRAINT fk_insumo_fornecedor
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id);

CREATE INDEX idx_insumo_fornecedor ON insumos(fornecedor_id);
CREATE INDEX idx_insumo_validade ON insumos(data_validade);
