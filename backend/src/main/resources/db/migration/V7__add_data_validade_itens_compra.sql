-- Adiciona coluna data_validade na tabela itens_compra
-- A entidade ItemCompra já possui o campo dataValidade mapeado,
-- mas a coluna não existia no banco de dados.
ALTER TABLE itens_compra ADD COLUMN data_validade DATE NULL;
