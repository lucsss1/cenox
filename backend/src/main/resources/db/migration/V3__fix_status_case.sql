-- =====================================================
-- COMANDA DIGITAL - Migration V3: Fix status case
-- Corrige valores de status em minusculo para maiusculo
-- =====================================================

UPDATE categorias SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE categorias SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';

UPDATE usuarios SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE usuarios SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';

UPDATE pratos SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE pratos SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';

UPDATE insumos SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE insumos SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';

UPDATE fornecedores SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE fornecedores SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';

UPDATE fichas_tecnicas SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE fichas_tecnicas SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';

UPDATE compras SET status = 'ATIVO' WHERE BINARY status != 'ATIVO' AND LOWER(status) = 'ativo';
UPDATE compras SET status = 'INATIVO' WHERE BINARY status != 'INATIVO' AND LOWER(status) = 'inativo';
