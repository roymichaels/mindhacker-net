
-- Coupon system for admin
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_to TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone authenticated can read active coupons (for validation)
CREATE POLICY "Users can read active coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Coupon usage log
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  order_context JSONB DEFAULT '{}'
);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own usage" ON public.coupon_usages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all usage" ON public.coupon_usages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Coach subscription tracking
CREATE TABLE public.coach_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'growth', 'scale')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  client_limit INTEGER NOT NULL DEFAULT 10,
  current_period_end TIMESTAMPTZ,
  coupon_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.coach_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" ON public.coach_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_subscriptions_updated_at BEFORE UPDATE ON public.coach_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Increment coupon usage count
CREATE OR REPLACE FUNCTION public.use_coupon(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_coupon RECORD;
  v_already_used BOOLEAN;
BEGIN
  SELECT * INTO v_coupon FROM coupons
  WHERE code = UPPER(TRIM(p_code)) AND is_active = true;

  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid coupon code');
  END IF;

  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon expired');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon usage limit reached');
  END IF;

  SELECT EXISTS(SELECT 1 FROM coupon_usages WHERE coupon_id = v_coupon.id AND user_id = p_user_id) INTO v_already_used;
  IF v_already_used THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon already used');
  END IF;

  UPDATE coupons SET current_uses = current_uses + 1 WHERE id = v_coupon.id;
  INSERT INTO coupon_usages (coupon_id, user_id) VALUES (v_coupon.id, p_user_id);

  RETURN jsonb_build_object(
    'success', true,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'coupon_id', v_coupon.id
  );
END;
$$;
