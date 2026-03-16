ALTER TABLE fornecedores
    ADD COLUMN nome_empresa VARCHAR(200) NULL AFTER id,
    ADD COLUMN responsavel_comercial VARCHAR(150) NULL AFTER endereco,
    ADD COLUMN status_fornecedor VARCHAR(20) NOT NULL DEFAULT 'EM_AVALIACAO' AFTER status;

UPDATE fornecedores SET nome_empresa = razao_social WHERE nome_empresa IS NULL;
