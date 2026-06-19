-- =====================================================
-- Migração 002: Adicionar colunas de estilo detalhado na tabela settings
-- Execute este script no SQL Editor do Supabase
-- =====================================================

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS name_font TEXT DEFAULT 'Playfair Display',
  ADD COLUMN IF NOT EXISTS name_size TEXT DEFAULT '6xl',
  ADD COLUMN IF NOT EXISTS name_weight TEXT DEFAULT 'bold',
  ADD COLUMN IF NOT EXISTS name_align TEXT DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS resumo_font TEXT DEFAULT 'Playfair Display',
  ADD COLUMN IF NOT EXISTS resumo_size TEXT DEFAULT 'xl',
  ADD COLUMN IF NOT EXISTS resumo_weight TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS resumo_align TEXT DEFAULT 'center';

-- Opcional: Garante que o registro id=1 tenha valores padrão se já existir
UPDATE settings
SET
  name_font = COALESCE(name_font, 'Playfair Display'),
  name_size = COALESCE(name_size, '6xl'),
  name_weight = COALESCE(name_weight, 'bold'),
  name_align = COALESCE(name_align, 'center'),
  resumo_font = COALESCE(resumo_font, 'Playfair Display'),
  resumo_size = COALESCE(resumo_size, 'xl'),
  resumo_weight = COALESCE(resumo_weight, 'normal'),
  resumo_align = COALESCE(resumo_align, 'center')
WHERE id = 1;
