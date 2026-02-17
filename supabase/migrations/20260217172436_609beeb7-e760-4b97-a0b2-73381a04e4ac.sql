
-- ============================================
-- Phase 1.1: Energy Events Ledger Table
-- ============================================
CREATE TABLE public.energy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint for idempotency (only on non-null keys)
CREATE UNIQUE INDEX idx_energy_events_idempotency ON public.energy_events (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Index for user queries
CREATE INDEX idx_energy_events_user_id ON public.energy_events (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.energy_events ENABLE ROW LEVEL SECURITY;

-- Users can only read their own events
CREATE POLICY "Users can read own energy events"
  ON public.energy_events FOR SELECT
  USING (auth.uid() = user_id);

-- No direct inserts/updates/deletes from client - only via RPCs (security definer)

-- ============================================
-- Phase 1.2: spend_energy RPC (atomic)
-- ============================================
CREATE OR REPLACE FUNCTION public.spend_energy(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_existing JSONB;
BEGIN
  -- Validate
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'new_balance', balance_after,
      'change', change,
      'idempotent', true
    ) INTO v_existing
    FROM public.energy_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Lock row and check balance
  SELECT COALESCE(tokens, 0) INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient energy',
      'current_balance', v_current_balance,
      'required', p_amount
    );
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Deduct
  UPDATE public.profiles
  SET tokens = v_new_balance, updated_at = now()
  WHERE id = p_user_id;

  -- Log event
  INSERT INTO public.energy_events (user_id, change, balance_after, source, reason, idempotency_key)
  VALUES (p_user_id, -p_amount, v_new_balance, p_source, p_reason, p_idempotency_key);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'change', -p_amount
  );
END;
$$;

-- ============================================
-- Phase 1.2: award_energy RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.award_energy(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_existing JSONB;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'new_balance', balance_after,
      'change', change,
      'idempotent', true
    ) INTO v_existing
    FROM public.energy_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Update balance
  UPDATE public.profiles
  SET tokens = COALESCE(tokens, 0) + p_amount, updated_at = now()
  WHERE id = p_user_id
  RETURNING tokens INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Log event
  INSERT INTO public.energy_events (user_id, change, balance_after, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, v_new_balance, p_source, p_reason, p_idempotency_key);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'change', p_amount
  );
END;
$$;

-- ============================================
-- Update award_unified_xp to use award_energy for level-up bonuses
-- ============================================
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_experience INTEGER;
  v_tokens_awarded INTEGER := 0;
  v_levels_gained INTEGER := 0;
  v_existing JSONB;
  v_energy_result JSONB;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'xp_gained', amount,
      'new_experience', 0,
      'old_level', 0,
      'new_level', 0,
      'levels_gained', 0,
      'tokens_awarded', 0,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  v_new_experience := v_new_experience + p_amount;
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Update profile (XP + level only, energy handled separately)
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);
  
  -- Award energy via ledger if levels gained
  IF v_tokens_awarded > 0 THEN
    PERFORM award_energy(
      p_user_id, 
      v_tokens_awarded, 
      'level_up', 
      'Leveled up from ' || v_old_level || ' to ' || v_new_level
    );
  END IF;
  
  RETURN jsonb_build_object(
    'xp_gained', p_amount,
    'new_experience', v_new_experience,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'tokens_awarded', v_tokens_awarded
  );
END;
$$;

-- Also update the 4-param overload
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN award_unified_xp(p_user_id, p_amount, p_source, p_reason, NULL::TEXT);
END;
$$;

-- Update handle_action_item_completion to use award_energy for token rewards
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      PERFORM award_energy(NEW.user_id, NEW.token_reward, 'action_item', NEW.title);
    END IF;
  END IF;
  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;
