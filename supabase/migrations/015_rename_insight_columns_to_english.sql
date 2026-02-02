-- Migration: rename V1.1 insight columns from Portuguese to English
-- Created: 2026-02-01

-- Rename contextual follow-up fields
ALTER TABLE insights RENAME COLUMN bloqueio_decisao TO decision_blocker;
ALTER TABLE insights RENAME COLUMN gargalo_entrevistas TO interview_bottleneck;
ALTER TABLE insights RENAME COLUMN fase_maxima TO max_stage;
ALTER TABLE insights RENAME COLUMN sinais_alavanca TO leverage_signals;
ALTER TABLE insights RENAME COLUMN tipo_pivot TO pivot_type;
ALTER TABLE insights RENAME COLUMN forcas_transferiveis TO transferable_strengths;
ALTER TABLE insights RENAME COLUMN decisao_evitando TO avoided_decision;

-- Rename diagnostic insight fields
ALTER TABLE insights RENAME COLUMN diagnostico TO diagnosis;
ALTER TABLE insights RENAME COLUMN padrao TO pattern;
ALTER TABLE insights RENAME COLUMN risco TO risk;
ALTER TABLE insights RENAME COLUMN proximo_passo TO next_step;

-- Update comments
COMMENT ON COLUMN insights.type IS 'V1.1 diagnostic insight type (movimento_vs_progresso, gargalo_errado, etc.)';
COMMENT ON COLUMN insights.type_label IS 'Human-readable label for the insight type';
COMMENT ON COLUMN insights.diagnosis IS 'V1.1 Current situation (diagnosis)';
COMMENT ON COLUMN insights.pattern IS 'V1.1 Observed pattern';
COMMENT ON COLUMN insights.risk IS 'V1.1 Open risk (uncomfortable truth)';
COMMENT ON COLUMN insights.next_step IS 'V1.1 One clear next action';
COMMENT ON COLUMN insights.input_hash IS 'Hash of input data for change detection';
COMMENT ON COLUMN insights.confidence IS 'Confidence level of the insight (high, medium, low)';
COMMENT ON COLUMN insights.decision_blocker IS 'Follow-up for avaliar_proposta: what blocks the decision';
COMMENT ON COLUMN insights.interview_bottleneck IS 'Follow-up for mais_entrevistas: where user gets stuck';
COMMENT ON COLUMN insights.max_stage IS 'Follow-up for avancar_processos: max stage reached';
COMMENT ON COLUMN insights.leverage_signals IS 'Follow-up for negociar_salario: leverage signals';
COMMENT ON COLUMN insights.pivot_type IS 'Follow-up for mudar_area: type of career pivot';
COMMENT ON COLUMN insights.transferable_strengths IS 'Follow-up for mudar_area: transferable strengths';
COMMENT ON COLUMN insights.avoided_decision IS 'Follow-up for outro: decision being avoided';
