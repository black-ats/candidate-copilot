-- Migration: add insight V1.1 fields for contextual follow-ups and diagnostic structure
-- Created: 2026-02-01

-- Add V1.1 contextual follow-up fields
ALTER TABLE insights 
ADD COLUMN IF NOT EXISTS bloqueio_decisao TEXT,
ADD COLUMN IF NOT EXISTS gargalo_entrevistas TEXT,
ADD COLUMN IF NOT EXISTS fase_maxima TEXT,
ADD COLUMN IF NOT EXISTS sinais_alavanca TEXT,
ADD COLUMN IF NOT EXISTS tipo_pivot TEXT,
ADD COLUMN IF NOT EXISTS forcas_transferiveis TEXT,
ADD COLUMN IF NOT EXISTS decisao_evitando TEXT;

-- Add V1.1 diagnostic insight fields
ALTER TABLE insights 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS type_label TEXT,
ADD COLUMN IF NOT EXISTS diagnostico TEXT,
ADD COLUMN IF NOT EXISTS padrao TEXT,
ADD COLUMN IF NOT EXISTS risco TEXT,
ADD COLUMN IF NOT EXISTS proximo_passo TEXT,
ADD COLUMN IF NOT EXISTS input_hash TEXT,
ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT 'medium';

-- Add index for insight type queries
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type);

-- Add index for input_hash for duplicate detection
CREATE INDEX IF NOT EXISTS idx_insights_input_hash ON insights(input_hash);

-- Note: Old fields (recommendation, why, risks, next_steps, objetivo_outro) remain for backward compatibility
-- They are nullable and can be ignored for V1.1 insights

COMMENT ON COLUMN insights.type IS 'V1.1 diagnostic insight type (movimento_vs_progresso, gargalo_errado, etc.)';
COMMENT ON COLUMN insights.type_label IS 'Human-readable label for the insight type';
COMMENT ON COLUMN insights.diagnostico IS 'V1.1 Situação atual (diagnosis)';
COMMENT ON COLUMN insights.padrao IS 'V1.1 Padrão observado (pattern detected)';
COMMENT ON COLUMN insights.risco IS 'V1.1 Risco aberto (uncomfortable truth)';
COMMENT ON COLUMN insights.proximo_passo IS 'V1.1 One clear next action';
COMMENT ON COLUMN insights.input_hash IS 'Hash of input data for change detection';
COMMENT ON COLUMN insights.confidence IS 'Confidence level of the insight (high, medium, low)';
COMMENT ON COLUMN insights.bloqueio_decisao IS 'Follow-up for avaliar_proposta: what blocks the decision';
COMMENT ON COLUMN insights.gargalo_entrevistas IS 'Follow-up for mais_entrevistas: where user gets stuck';
COMMENT ON COLUMN insights.fase_maxima IS 'Follow-up for avancar_processos: max stage reached';
COMMENT ON COLUMN insights.sinais_alavanca IS 'Follow-up for negociar_salario: leverage signals';
COMMENT ON COLUMN insights.tipo_pivot IS 'Follow-up for mudar_area: type of career pivot';
COMMENT ON COLUMN insights.forcas_transferiveis IS 'Follow-up for mudar_area: transferable strengths';
COMMENT ON COLUMN insights.decisao_evitando IS 'Follow-up for outro: decision being avoided';
