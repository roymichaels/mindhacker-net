
-- Add missing enum values for subscription_status to match Stripe statuses
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'trialing';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'past_due';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'unpaid';

-- Add subscription columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add missing columns to user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS price_id TEXT,
  ADD COLUMN IF NOT EXISTS product_id TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Index for fast entitlement lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON public.user_subscriptions (user_id, status);

-- Index for webhook customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON public.profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
