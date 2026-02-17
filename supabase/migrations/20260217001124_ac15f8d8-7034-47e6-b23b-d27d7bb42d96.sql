
-- ============================================================================
-- ROBUSTNESS: Idempotency, XP Immutability, Error Logging, FK Enforcement
-- ============================================================================

-- A1: Add idempotency_key to xp_events
ALTER TABLE public.xp_events ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_events_idempotency ON public.xp_events(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- A1: Add idempotency_key to aurora_proactive_queue
ALTER TABLE public.aurora_proactive_queue ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_proactive_queue_idempotency ON public.aurora_proactive_queue(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- A1: Modify award_unified_xp to support idempotency
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid, 
  p_amount integer, 
  p_source text, 
  p_reason text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old_level integer;
  v_new_level integer;
  v_new_experience integer;
  v_tokens_awarded integer := 0;
  v_levels_gained integer := 0;
  v_existing jsonb;
BEGIN
  -- Idempotency check: if key provided and already exists, return previous result
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
  
  -- Calculate new experience
  v_new_experience := v_new_experience + p_amount;
  
  -- Calculate new level (100 XP per level)
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  -- Calculate levels gained and token bonus (5 tokens per level)
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    tokens = COALESCE(tokens, 0) + v_tokens_awarded,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event with idempotency key
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);
  
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

-- B1: Make xp_events append-only (block UPDATE and DELETE)
CREATE POLICY "xp_events_no_update" ON public.xp_events FOR UPDATE USING (false);
CREATE POLICY "xp_events_no_delete" ON public.xp_events FOR DELETE USING (false);

-- B1: Reconciliation function
CREATE OR REPLACE FUNCTION public.reconcile_user_xp(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_expected integer;
  v_actual integer;
  v_drift integer;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_expected FROM public.xp_events WHERE user_id = p_user_id;
  SELECT COALESCE(experience, 0) INTO v_actual FROM public.profiles WHERE id = p_user_id;
  v_drift := v_actual - v_expected;
  
  IF v_drift != 0 THEN
    UPDATE public.profiles 
    SET experience = v_expected, level = GREATEST(1, FLOOR(v_expected / 100) + 1), updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object('expected', v_expected, 'actual', v_actual, 'drift', v_drift, 'corrected', v_drift != 0);
END;
$$;

-- B1: Integrity check across all users
CREATE OR REPLACE FUNCTION public.check_xp_integrity()
RETURNS TABLE(user_id uuid, expected_xp bigint, actual_xp integer, drift bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id as user_id,
    COALESCE(e.total, 0) as expected_xp,
    COALESCE(p.experience, 0) as actual_xp,
    COALESCE(p.experience, 0) - COALESCE(e.total, 0) as drift
  FROM public.profiles p
  LEFT JOIN (SELECT user_id, SUM(amount) as total FROM public.xp_events GROUP BY user_id) e ON e.user_id = p.id
  WHERE COALESCE(p.experience, 0) != COALESCE(e.total, 0);
$$;

-- A3: Central error logging table
CREATE TABLE IF NOT EXISTS public.edge_function_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_id UUID,
  request_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_function_errors ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (edge functions use service role)
-- No user access needed
CREATE POLICY "edge_function_errors_service_only" ON public.edge_function_errors FOR ALL USING (false);

CREATE INDEX idx_edge_errors_function ON public.edge_function_errors(function_name, created_at DESC);
CREATE INDEX idx_edge_errors_created ON public.edge_function_errors(created_at DESC);

-- B3: FK on ai_response_logs.user_id (with safety check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ai_response_logs_user_id_fkey' AND table_name = 'ai_response_logs'
  ) THEN
    ALTER TABLE public.ai_response_logs 
    ADD CONSTRAINT ai_response_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
