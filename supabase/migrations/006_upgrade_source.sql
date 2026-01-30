-- Track how user got Pro access (stripe payment vs free whitelist)
ALTER TABLE user_profiles 
ADD COLUMN upgrade_source TEXT CHECK (upgrade_source IN ('stripe', 'whitelist', NULL));

-- Update existing Pro users with stripe subscription to have 'stripe' source
UPDATE user_profiles 
SET upgrade_source = 'stripe' 
WHERE plan = 'pro' AND subscription_id IS NOT NULL;
