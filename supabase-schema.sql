-- Enums
CREATE TYPE "TipoTrabalho" AS ENUM ('CLT', 'PJ', 'PostoTrabalho', 'Terceiro');
CREATE TYPE "SituacaoTrabalho" AS ENUM ('Trabalhando', 'Afastado', 'Desligado');
CREATE TYPE "StatusEquipamento" AS ENUM ('Ativo', 'Estoque', 'Desativado', 'Baixado', 'EmManutencao', 'FurtadoRoubado');
CREATE TYPE "PerfilAcesso" AS ENUM ('Administrador', 'GestorTI', 'Tecnico', 'Consultor');
CREATE TYPE "AcaoAudit" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYNC');

-- Tabelas
CREATE TABLE IF NOT EXISTS "empresas" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "cnpj" TEXT UNIQUE,
  "ativo" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "unidades" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "uf" TEXT NOT NULL,
  "empresaId" INTEGER NOT NULL REFERENCES "empresas"("id")
);

CREATE TABLE IF NOT EXISTS "tipos_equipamento" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL UNIQUE,
  "icone" TEXT
);

CREATE TABLE IF NOT EXISTS "marcas" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "tipos_posse" (
  "id" SERIAL PRIMARY KEY,
  "categoria" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "contratos" (
  "id" SERIAL PRIMARY KEY,
  "numero" TEXT NOT NULL UNIQUE,
  "fornecedor" TEXT,
  "dataContrato" TIMESTAMP NOT NULL,
  "dataFinal" TIMESTAMP NOT NULL,
  "valor" DECIMAL(12,2),
  "observacoes" TEXT
);

CREATE TABLE IF NOT EXISTS "colaboradores" (
  "id" TEXT PRIMARY KEY,
  "matricula" TEXT,
  "nome" TEXT NOT NULL,
  "cargo" TEXT,
  "setor" TEXT,
  "unidadeId" INTEGER NOT NULL REFERENCES "unidades"("id"),
  "tipoTrabalho" "TipoTrabalho" NOT NULL,
  "situacao" "SituacaoTrabalho" NOT NULL DEFAULT 'Trabalhando',
  "dataAdmissao" TIMESTAMP,
  "dataDesligamento" TIMESTAMP,
  "userRede" TEXT,
  "email" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "equipamentos" (
  "nserial" TEXT PRIMARY KEY,
  "dataAtualizacao" TIMESTAMP,
  "status" "StatusEquipamento" NOT NULL DEFAULT 'Ativo',
  "patrimonio" TEXT,
  "tipoEquipId" INTEGER NOT NULL REFERENCES "tipos_equipamento"("id"),
  "posseId" INTEGER NOT NULL REFERENCES "tipos_posse"("id"),
  "contratoId" INTEGER REFERENCES "contratos"("id"),
  "marcaId" INTEGER REFERENCES "marcas"("id"),
  "modelo" TEXT,
  "processador" TEXT,
  "geracao" TEXT,
  "ram" TEXT,
  "memoriaDisco" TEXT,
  "unidadeId" INTEGER NOT NULL REFERENCES "unidades"("id"),
  "observacoes" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "equipamento_usuarios" (
  "nserial" TEXT NOT NULL REFERENCES "equipamentos"("nserial"),
  "colaboradorId" TEXT NOT NULL REFERENCES "colaboradores"("id"),
  "unidadeId" INTEGER NOT NULL,
  "cargo" TEXT,
  "setor" TEXT,
  "dataVinculo" TIMESTAMP NOT NULL DEFAULT NOW(),
  "dataDesvinculo" TIMESTAMP,
  "principal" BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY ("nserial", "colaboradorId")
);

CREATE TABLE IF NOT EXISTS "tipos_licenca" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL UNIQUE,
  "tipo" TEXT NOT NULL,
  "descricao" TEXT,
  "custo" DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS "licenca_usuarios" (
  "id" SERIAL PRIMARY KEY,
  "colaboradorId" TEXT NOT NULL REFERENCES "colaboradores"("id"),
  "licencaId" INTEGER NOT NULL REFERENCES "tipos_licenca"("id"),
  "dataInicio" TIMESTAMP NOT NULL DEFAULT NOW(),
  "dataFim" TIMESTAMP,
  "ativa" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "categorias_perfil" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL UNIQUE,
  "processamento" TEXT NOT NULL,
  "ram" TEXT NOT NULL,
  "memoriaDisco" TEXT NOT NULL,
  "mobilidade" BOOLEAN NOT NULL,
  "licencaOffice" TEXT NOT NULL,
  "fabric" BOOLEAN NOT NULL DEFAULT false,
  "project" BOOLEAN NOT NULL DEFAULT false,
  "powerBi" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "termos_equipamento" (
  "id" SERIAL PRIMARY KEY,
  "unidadeId" INTEGER NOT NULL,
  "colaboradorId" TEXT NOT NULL REFERENCES "colaboradores"("id"),
  "nserialNovo" TEXT REFERENCES "equipamentos"("nserial"),
  "nserialDevolvido" TEXT REFERENCES "equipamentos"("nserial"),
  "termoDigitalizado" BOOLEAN NOT NULL DEFAULT false,
  "arquivoUrl" TEXT,
  "dataAssinatura" TIMESTAMP NOT NULL,
  "nomeCompleto" TEXT NOT NULL,
  "criadoEm" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ocorrencias" (
  "id" SERIAL PRIMARY KEY,
  "nserial" TEXT NOT NULL REFERENCES "equipamentos"("nserial"),
  "tipo" TEXT,
  "descricao" TEXT NOT NULL,
  "dataOcorr" TIMESTAMP NOT NULL DEFAULT NOW(),
  "resolvidoEm" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" SERIAL PRIMARY KEY,
  "tabela" TEXT NOT NULL,
  "registroId" TEXT NOT NULL,
  "campo" TEXT,
  "valorAnterior" TEXT,
  "valorNovo" TEXT,
  "acao" "AcaoAudit" NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "usuarioNome" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "usuarios_sistema" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "nome" TEXT NOT NULL,
  "senha" TEXT NOT NULL,
  "perfil" "PerfilAcesso" NOT NULL,
  "empresasIds" INTEGER[] NOT NULL DEFAULT '{}',
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "ultimoAcesso" TIMESTAMP,
  "criadoEm" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS "audit_logs_tabela_registroId_idx" ON "audit_logs"("tabela", "registroId");
CREATE INDEX IF NOT EXISTS "audit_logs_usuarioId_idx" ON "audit_logs"("usuarioId");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- RLS: AuditLog imutável
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "audit_no_update" ON "audit_logs" FOR UPDATE USING (false);
CREATE POLICY IF NOT EXISTS "audit_no_delete" ON "audit_logs" FOR DELETE USING (false);

-- Tabela de controle do Prisma (necessária para o ORM)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- SEED — Patrimônio Cassol
-- =============================================

-- Tipos de Equipamento
INSERT INTO "tipos_equipamento" ("nome", "icone") VALUES
  ('Notebook', 'laptop'),
  ('Desktop', 'monitor'),
  ('Servidor', 'server'),
  ('Monitor', 'monitor'),
  ('Mouse', 'mouse-pointer'),
  ('Teclado', 'keyboard'),
  ('Coletor', 'scan')
ON CONFLICT ("nome") DO NOTHING;

-- Marcas
INSERT INTO "marcas" ("nome") VALUES
  ('Dell'), ('Lenovo'), ('HP'), ('Apple'), ('Samsung'), ('Datalogic')
ON CONFLICT ("nome") DO NOTHING;

-- Tipos de Posse
INSERT INTO "tipos_posse" ("categoria") VALUES
  ('Próprio'), ('Alugado'), ('Particular')
ON CONFLICT ("categoria") DO NOTHING;

-- Tipos de Licença
INSERT INTO "tipos_licenca" ("nome", "tipo", "descricao", "custo") VALUES
  ('Microsoft 365 Business Standard', 'Office', 'Suite Office completa + Teams', 57.00),
  ('Exchange Online Plan 1', 'Email', 'Email corporativo 50GB', 17.00),
  ('Power BI Pro', 'Analytics', 'Business Intelligence', 57.00),
  ('Microsoft Fabric', 'Analytics', 'Data platform unificada', 115.00),
  ('Microsoft Project Plan 3', 'Gestão', 'Gerenciamento de projetos', 57.00)
ON CONFLICT ("nome") DO NOTHING;

-- Empresas do Grupo Cassol
INSERT INTO "empresas" ("id", "nome", "cnpj") VALUES
  (1, 'Cassol Materiais de Construção', '00.000.001/0001-00'),
  (2, 'Cassol Pré-Fabricados', '00.000.002/0001-00'),
  (3, 'Cassol Logística', '00.000.003/0001-00'),
  (4, 'Cassol Real Estate', '00.000.004/0001-00'),
  (5, 'Cassol Florestal', '00.000.005/0001-00'),
  (6, 'Cassol Administradora de Cartões', '00.000.006/0001-00')
ON CONFLICT ("id") DO NOTHING;

-- Unidades
INSERT INTO "unidades" ("id", "nome", "uf", "empresaId") VALUES
  (1, 'Matriz - Florianópolis', 'SC', 1),
  (2, 'Filial Joinville', 'SC', 1),
  (3, 'Sede Pré-Fabricados', 'SC', 2),
  (4, 'Centro Logístico Palhoça', 'SC', 3),
  (5, 'Escritório Real Estate', 'SC', 4)
ON CONFLICT ("id") DO NOTHING;

-- Contrato de exemplo
INSERT INTO "contratos" ("numero", "fornecedor", "dataContrato", "dataFinal", "valor", "observacoes") VALUES
  ('CTR-2024-001', 'Dell Financial Services', '2024-01-15', '2026-01-15', 125000.00, 'Contrato de locação de notebooks Dell Latitude')
ON CONFLICT ("numero") DO NOTHING;

-- Colaboradores
INSERT INTO "colaboradores" ("id", "matricula", "nome", "cargo", "setor", "unidadeId", "tipoTrabalho", "situacao", "dataAdmissao", "userRede", "email") VALUES
  ('111.111.111-11', '001001', 'Ana Paula Ferreira', 'Analista de TI', 'Tecnologia da Informação', 1, 'CLT', 'Trabalhando', '2020-03-01', 'ana.ferreira', 'ana.ferreira@cassol.com.br'),
  ('222.222.222-22', '001002', 'Carlos Eduardo Santos', 'Gerente de TI', 'Tecnologia da Informação', 1, 'CLT', 'Trabalhando', '2018-06-15', 'carlos.santos', 'carlos.santos@cassol.com.br'),
  ('333.333.333-33', '002001', 'Mariana Oliveira Costa', 'Analista Financeiro', 'Financeiro', 2, 'CLT', 'Trabalhando', '2021-09-01', 'mariana.costa', 'mariana.costa@cassol.com.br'),
  ('444.444.444-44', '003001', 'Roberto Lima Pereira', 'Técnico de Suporte', 'Tecnologia da Informação', 3, 'Terceiro', 'Trabalhando', '2022-01-10', 'roberto.pereira', 'roberto.pereira@cassol.com.br'),
  ('555.555.555-55', '001003', 'Fernanda Rodrigues Silva', 'Coordenadora de RH', 'Recursos Humanos', 1, 'CLT', 'Afastado', '2019-11-20', 'fernanda.silva', 'fernanda.silva@cassol.com.br')
ON CONFLICT ("id") DO NOTHING;

-- Equipamentos
INSERT INTO "equipamentos" ("nserial", "status", "patrimonio", "tipoEquipId", "posseId", "marcaId", "unidadeId", "contratoId", "modelo", "processador", "ram", "memoriaDisco", "dataAtualizacao") VALUES
  ('NB-DELL-001', 'Ativo', 'PAT-001', 1, 2, 1, 1, 1, 'Latitude 5540', 'Intel Core i7-1365U', '16GB', '512GB SSD', NOW()),
  ('NB-DELL-002', 'Ativo', 'PAT-002', 1, 2, 1, 1, 1, 'Latitude 5540', 'Intel Core i7-1365U', '16GB', '512GB SSD', NOW()),
  ('NB-LEN-003', 'Ativo', 'PAT-003', 1, 1, 2, 2, NULL, 'ThinkPad E14', 'AMD Ryzen 5 5600U', '8GB', '256GB SSD', NOW()),
  ('DT-HP-001', 'Ativo', 'PAT-004', 2, 1, 3, 3, NULL, 'EliteDesk 800 G9', 'Intel Core i5-13500', '16GB', '512GB SSD', NOW()),
  ('MN-DELL-001', 'Ativo', 'PAT-005', 4, 1, 1, 1, NULL, 'P2422H', NULL, NULL, NULL, NOW()),
  ('NB-DELL-003', 'Estoque', 'PAT-006', 1, 2, 1, 1, 1, 'Latitude 5540', 'Intel Core i7-1365U', '16GB', '512GB SSD', NOW()),
  ('CLT-DAT-001', 'Ativo', 'PAT-007', 7, 1, 6, 4, NULL, 'Memor 20', NULL, NULL, NULL, NOW()),
  ('NB-APL-001', 'Ativo', NULL, 1, 3, 4, 1, NULL, 'MacBook Pro M3', 'Apple M3 Pro', '18GB', '512GB SSD', NOW())
ON CONFLICT ("nserial") DO NOTHING;

-- Vínculos equipamento-usuário
INSERT INTO "equipamento_usuarios" ("nserial", "colaboradorId", "unidadeId", "cargo", "setor", "principal") VALUES
  ('NB-DELL-001', '111.111.111-11', 1, 'Analista de TI', 'Tecnologia da Informação', true),
  ('NB-DELL-002', '222.222.222-22', 1, 'Gerente de TI', 'Tecnologia da Informação', true),
  ('NB-LEN-003', '333.333.333-33', 2, 'Analista Financeiro', 'Financeiro', true),
  ('DT-HP-001', '444.444.444-44', 3, 'Técnico de Suporte', 'Tecnologia da Informação', true),
  ('MN-DELL-001', '222.222.222-22', 1, 'Gerente de TI', 'Tecnologia da Informação', false)
ON CONFLICT ("nserial", "colaboradorId") DO NOTHING;

-- Licenças de usuários
INSERT INTO "licenca_usuarios" ("colaboradorId", "licencaId") VALUES
  ('111.111.111-11', (SELECT id FROM tipos_licenca WHERE nome = 'Microsoft 365 Business Standard')),
  ('111.111.111-11', (SELECT id FROM tipos_licenca WHERE nome = 'Exchange Online Plan 1')),
  ('222.222.222-22', (SELECT id FROM tipos_licenca WHERE nome = 'Microsoft 365 Business Standard')),
  ('222.222.222-22', (SELECT id FROM tipos_licenca WHERE nome = 'Power BI Pro')),
  ('333.333.333-33', (SELECT id FROM tipos_licenca WHERE nome = 'Microsoft 365 Business Standard'))
ON CONFLICT DO NOTHING;

-- Categorias de perfil
INSERT INTO "categorias_perfil" ("nome", "processamento", "ram", "memoriaDisco", "mobilidade", "licencaOffice", "fabric", "project", "powerBi") VALUES
  ('BÁSICO 01', 'Intel Core i3 / Ryzen 3', '8GB', '256GB SSD', false, 'Microsoft 365 Apps', false, false, false),
  ('BÁSICO 02', 'Intel Core i5 / Ryzen 5', '8GB', '256GB SSD', true, 'Microsoft 365 Business Standard', false, false, false),
  ('INTERMEDIÁRIO', 'Intel Core i5 / Ryzen 5', '16GB', '512GB SSD', true, 'Microsoft 365 Business Standard', false, false, true),
  ('AVANÇADO', 'Intel Core i7 / Ryzen 7', '16GB', '512GB SSD', true, 'Microsoft 365 Business Premium', true, true, true),
  ('EXECUTIVO', 'Intel Core i7/i9 / Apple M-series', '32GB', '1TB SSD', true, 'Microsoft 365 Business Premium', true, true, true)
ON CONFLICT ("nome") DO NOTHING;

-- Ocorrência de exemplo
INSERT INTO "ocorrencias" ("nserial", "tipo", "descricao", "dataOcorr", "resolvidoEm") VALUES
  ('NB-DELL-001', 'Manutenção', 'Troca de bateria realizada. Bateria apresentava degradação acima de 80%.', '2024-08-10', '2024-08-12')
ON CONFLICT DO NOTHING;

-- Usuários do sistema
INSERT INTO "usuarios_sistema" ("email", "nome", "senha", "perfil", "empresasIds") VALUES
  ('admin@cassol.com.br', 'Administrador do Sistema', '$2b$12$TmX57gRc8scQLh0PQVgagOOUGsIo0r9lkmqvUtRYEwSok9cyZE4oe', 'Administrador', '{1,2,3,4,5,6}'),
  ('gestor.ti@cassol.com.br', 'Carlos Eduardo Santos', '$2b$12$ISBCRr2Z2clRX6IHqwpKSeaasj/u9z1rNEVhYN8S/hjkDDiU18b1G', 'GestorTI', '{1,2,3}')
ON CONFLICT ("email") DO NOTHING;

-- Sequências (garantir que os IDs comecem corretos após insert manual)
SELECT setval('empresas_id_seq', (SELECT MAX(id) FROM empresas));
SELECT setval('unidades_id_seq', (SELECT MAX(id) FROM unidades));

