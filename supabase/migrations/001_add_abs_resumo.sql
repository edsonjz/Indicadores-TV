-- =====================================================
-- Migração 001: Adicionar colunas abs e resumo
-- Execute este script no SQL Editor do Supabase
-- =====================================================

ALTER TABLE operators
  ADD COLUMN IF NOT EXISTS abs TEXT DEFAULT '0%',
  ADD COLUMN IF NOT EXISTS resumo TEXT DEFAULT '';

-- Confirma as colunas adicionadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'operators'
  AND column_name IN ('abs', 'resumo');
