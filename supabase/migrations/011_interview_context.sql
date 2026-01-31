-- Add context columns to interview_sessions for enriched interview preparation
-- Allows users to prepare for specific job applications

ALTER TABLE interview_sessions
  ADD COLUMN company TEXT,
  ADD COLUMN source TEXT CHECK (source IN ('job', 'insight', 'manual')),
  ADD COLUMN application_id UUID REFERENCES applications(id) ON DELETE SET NULL;

-- Index for application_id to optimize queries filtering by application
CREATE INDEX idx_interview_sessions_application_id ON interview_sessions(application_id);

-- Index for source to track usage patterns
CREATE INDEX idx_interview_sessions_source ON interview_sessions(source);

COMMENT ON COLUMN interview_sessions.company IS 'Company name for context-aware questions';
COMMENT ON COLUMN interview_sessions.source IS 'How the interview context was selected: job application, last insight, or manual entry';
COMMENT ON COLUMN interview_sessions.application_id IS 'Reference to the job application being practiced for';
