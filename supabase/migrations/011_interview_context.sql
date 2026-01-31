-- Add context columns to interview_sessions for enriched interview preparation
-- Allows users to prepare for specific job applications
-- Using IF NOT EXISTS for idempotency

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('job', 'insight', 'manual')),
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE SET NULL;

-- Index for application_id to optimize queries filtering by application
CREATE INDEX IF NOT EXISTS idx_interview_sessions_application_id ON interview_sessions(application_id);

-- Index for source to track usage patterns
CREATE INDEX IF NOT EXISTS idx_interview_sessions_source ON interview_sessions(source);

COMMENT ON COLUMN interview_sessions.company IS 'Company name for context-aware questions';
COMMENT ON COLUMN interview_sessions.source IS 'How the interview context was selected: job application, last insight, or manual entry';
COMMENT ON COLUMN interview_sessions.application_id IS 'Reference to the job application being practiced for';
