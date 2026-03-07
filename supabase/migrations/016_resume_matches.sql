-- Resume Match: stores resume vs job description analysis results
CREATE TABLE IF NOT EXISTS resume_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Inputs
  resume_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  
  -- Results
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  ats_risk TEXT NOT NULL CHECK (ats_risk IN ('low', 'medium', 'high')),
  
  -- Structured analysis (stored as JSONB)
  missing_signals JSONB DEFAULT '[]'::jsonb,
  resume_weaknesses JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  diagnosis TEXT,
  
  -- Metadata
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE resume_matches ENABLE ROW LEVEL SECURITY;

-- Users can read their own matches
CREATE POLICY "Users can read own matches"
  ON resume_matches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own matches
CREATE POLICY "Users can insert own matches"
  ON resume_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own matches
CREATE POLICY "Users can delete own matches"
  ON resume_matches FOR DELETE
  USING (auth.uid() = user_id);

-- Index for user lookups
CREATE INDEX idx_resume_matches_user_id ON resume_matches(user_id);
CREATE INDEX idx_resume_matches_created_at ON resume_matches(created_at DESC);

-- Add matches_used_this_month to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS matches_used_this_month INTEGER DEFAULT 0;
