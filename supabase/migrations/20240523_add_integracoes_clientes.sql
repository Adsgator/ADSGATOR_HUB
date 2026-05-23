-- Migração: Adicionar campos de integração à tabela clientes
-- Data: 2024-05-23

-- Adicionar campos de integração ao cliente
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_ads_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ga4_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gmb_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS looker_url TEXT;

-- Atualizar registros existentes para ter valores padrão
UPDATE clientes 
SET google_ads_enabled = FALSE 
WHERE google_ads_enabled IS NULL;

UPDATE clientes 
SET ga4_enabled = FALSE 
WHERE ga4_enabled IS NULL;

-- Criar índices para buscas rápidas (opcional, se necessário)
CREATE INDEX IF NOT EXISTS idx_clientes_google_ads_enabled ON clientes(google_ads_enabled) WHERE google_ads_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_clientes_ga4_enabled ON clientes(ga4_enabled) WHERE ga4_enabled = TRUE;
