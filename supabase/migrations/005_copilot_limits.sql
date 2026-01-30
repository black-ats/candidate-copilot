-- Add copilot daily usage tracking to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN copilot_messages_today INT NOT NULL DEFAULT 0,
ADD COLUMN copilot_reset_at TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('day', now()) + interval '1 day');

-- Function to increment copilot usage (called from server action)
CREATE OR REPLACE FUNCTION increment_copilot_usage(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    copilot_messages_today = copilot_messages_today + 1,
    updated_at = now()
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset copilot usage if day changed
CREATE OR REPLACE FUNCTION reset_copilot_if_needed(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    copilot_messages_today = 0,
    copilot_reset_at = date_trunc('day', now()) + interval '1 day',
    updated_at = now()
  WHERE user_id = user_id_param
    AND copilot_reset_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
