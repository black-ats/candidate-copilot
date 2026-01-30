-- Add monthly applications counter (similar to insights)
ALTER TABLE user_profiles 
ADD COLUMN applications_used_this_month INT NOT NULL DEFAULT 0;

-- Remove database functions - all logic will be in application code
DROP FUNCTION IF EXISTS increment_application_usage(UUID);
DROP FUNCTION IF EXISTS increment_insight_usage(UUID);
DROP FUNCTION IF EXISTS increment_copilot_usage(UUID);
DROP FUNCTION IF EXISTS reset_copilot_if_needed(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Add INSERT policy for users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
