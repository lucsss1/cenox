-- =====================================================
-- COMANDA DIGITAL - Migration V2: Seed inicial
-- Senha: senha123 (BCrypt hash)
-- =====================================================

INSERT INTO usuarios (nome, email, senha, perfil, status) VALUES
('Administrador', 'admin@email.com', '$2a$10$1nqJIo1GvduHb1MHhWkjQu8b6cRKPp3lo164Ed6Jx3TkMLsgRAK66', 'ADMIN', 'ATIVO');

-- Categorias iniciais
INSERT INTO categorias (nome, descricao, status) VALUES
('Entradas', 'Pratos de entrada e aperitivos', 'ATIVO'),
('Pratos Principais', 'Pratos principais do cardapio', 'ATIVO'),
('Sobremesas', 'Sobremesas e doces', 'ATIVO'),
('Bebidas', 'Bebidas diversas', 'ATIVO');
