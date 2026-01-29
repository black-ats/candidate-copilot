-- Waitlist table for collecting early access signups
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  feature TEXT NOT NULL DEFAULT 'interview-pro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT -- 'landing', 'dashboard', 'insight', 'direct'
);

-- RLS Policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for waitlist signups)
CREATE POLICY "Allow anonymous inserts" ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users and service role to read
CREATE POLICY "Allow authenticated reads" ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Index for faster lookups by email
CREATE INDEX waitlist_email_idx ON waitlist(email);

-- Index for filtering by feature
CREATE INDEX waitlist_feature_idx ON waitlist(feature);
