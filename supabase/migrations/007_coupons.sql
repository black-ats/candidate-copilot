-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
  duration_months INT NOT NULL CHECK (duration_months >= 1),
  max_uses INT, -- NULL = unlimited
  times_used INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ, -- NULL = no expiration
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add coupon tracking to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN coupon_code TEXT,
ADD COLUMN coupon_applied_at TIMESTAMPTZ,
ADD COLUMN coupon_expires_at TIMESTAMPTZ;

-- Index for coupon code lookups
CREATE INDEX idx_coupons_code ON coupons(code);

-- RLS for coupons (only admins can manage, but anyone can read active coupons)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow reading active coupons (for validation)
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

-- Insert default coupon: PRIMEIRACOMPRA100
-- 100% discount, 1 month, unlimited global uses (each user can use once)
INSERT INTO coupons (code, discount_percent, duration_months, max_uses)
VALUES ('PRIMEIRACOMPRA100', 100, 1, NULL);

-- Create profiles for existing users who don't have one
INSERT INTO user_profiles (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;
