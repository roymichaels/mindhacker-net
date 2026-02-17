
-- Phase 1: Monetization Infrastructure Migration

-- 1. Deactivate old tiers
UPDATE public.subscription_tiers SET is_active = false WHERE slug IN ('hatchala', 'hatmara', 'shinui');

-- 2. Insert Free tier
INSERT INTO public.subscription_tiers (
  name, slug, description, price_monthly, price_quarterly, price_yearly,
  access_level, features, max_downloads_per_month, can_download_resources,
  priority_support, is_active, order_index
) VALUES (
  'Free', 'free', 'גישה בסיסית למערכת',
  0, 0, 0,
  'basic',
  ARRAY['5 הודעות יומיות לאורורה', 'עד 3 הרגלים פעילים', 'מסע התודעה (אונבורדינג)', 'כרטיסיית היום'],
  0, false, false, true, 0
);

-- 3. Insert Pro tier
INSERT INTO public.subscription_tiers (
  name, slug, description, price_monthly, price_quarterly, price_yearly,
  access_level, features, max_downloads_per_month, can_download_resources,
  priority_support, is_active, order_index
) VALUES (
  'Pro', 'pro', 'גישה מלאה למערכת MindOS',
  97, 261, 930,
  'premium',
  ARRAY['הודעות ללא הגבלה לאורורה', 'מנוע תכנון 90 יום מלא', 'נאדג׳ים פרואקטיביים', 'ספריית היפנוזה', 'הרגלים ורשימות ללא הגבלה', 'כל מרכזי העמודים פתוחים'],
  999, true, true, true, 1
);

-- 4. Add Stripe columns to user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 5. Create daily_message_counts table
CREATE TABLE IF NOT EXISTS public.daily_message_counts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, message_date)
);

-- 6. Enable RLS on daily_message_counts
ALTER TABLE public.daily_message_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own message counts"
  ON public.daily_message_counts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message counts"
  ON public.daily_message_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own message counts"
  ON public.daily_message_counts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Function to increment daily message count (called from edge function)
CREATE OR REPLACE FUNCTION public.increment_daily_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.daily_message_counts (user_id, message_date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, message_date)
  DO UPDATE SET count = daily_message_counts.count + 1, updated_at = now()
  RETURNING count INTO v_count;
  
  RETURN v_count;
END;
$$;
