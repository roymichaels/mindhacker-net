
-- ═══════════════════════════════════════════════════
-- Play2Earn Mining Engine: Tables & Functions
-- ═══════════════════════════════════════════════════

-- 1. Mining Rules — defines which activities earn MOS and how much
CREATE TABLE public.fm_mining_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL UNIQUE, -- e.g. 'hypnosis_session', 'habit_streak', 'community_post', 'learning_lesson'
  label_en text NOT NULL,
  label_he text NOT NULL,
  base_reward integer NOT NULL DEFAULT 5,
  max_daily integer NOT NULL DEFAULT 200, -- daily cap per activity type
  cooldown_minutes integer NOT NULL DEFAULT 60, -- min time between same-type rewards
  min_duration_seconds integer DEFAULT NULL, -- for sessions: minimum duration to qualify
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_mining_rules ENABLE ROW LEVEL SECURITY;

-- Everyone can read rules (they're public config)
CREATE POLICY "Anyone can read mining rules"
ON public.fm_mining_rules FOR SELECT
TO authenticated
USING (true);

-- 2. Mining Logs — immutable record of every mining event
CREATE TABLE public.fm_mining_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id uuid NOT NULL REFERENCES public.fm_mining_rules(id),
  activity_type text NOT NULL,
  mos_awarded integer NOT NULL,
  source_table text, -- e.g. 'hypnosis_sessions'
  source_id text, -- ID of the triggering row
  idempotency_key text UNIQUE, -- prevents double-mining
  metadata jsonb DEFAULT '{}',
  mined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_mining_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mining logs"
ON public.fm_mining_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE INDEX idx_fm_mining_logs_user_date ON public.fm_mining_logs(user_id, mined_at);
CREATE INDEX idx_fm_mining_logs_idempotency ON public.fm_mining_logs(idempotency_key);

-- 3. Data Consent — granular opt-in toggles for data marketplace
CREATE TABLE public.fm_data_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'sleep_patterns', 'habit_trends', 'mood_signals', 'training_results'
  is_opted_in boolean NOT NULL DEFAULT false,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.fm_data_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data consent"
ON public.fm_data_consent FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Mining Engine Function — validates & awards MOS
CREATE OR REPLACE FUNCTION public.fm_mine_activity(
  p_user_id uuid,
  p_activity_type text,
  p_source_table text DEFAULT NULL,
  p_source_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule RECORD;
  v_today_total integer;
  v_last_mine timestamptz;
  v_idem_key text;
  v_tx_result jsonb;
BEGIN
  -- 1. Get active rule
  SELECT * INTO v_rule
  FROM public.fm_mining_rules
  WHERE activity_type = p_activity_type AND is_active = true;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active rule for: ' || p_activity_type);
  END IF;

  -- 2. Build idempotency key
  v_idem_key := 'mine_' || p_user_id || '_' || p_activity_type || '_' || COALESCE(p_source_id, extract(epoch from now())::text);

  -- Check if already mined
  IF EXISTS(SELECT 1 FROM public.fm_mining_logs WHERE idempotency_key = v_idem_key) THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true, 'message', 'Already mined');
  END IF;

  -- 3. Check daily cap
  SELECT COALESCE(SUM(mos_awarded), 0) INTO v_today_total
  FROM public.fm_mining_logs
  WHERE user_id = p_user_id
    AND activity_type = p_activity_type
    AND mined_at >= CURRENT_DATE;

  IF v_today_total >= v_rule.max_daily THEN
    RETURN jsonb_build_object('success', false, 'error', 'Daily cap reached', 'cap', v_rule.max_daily, 'earned_today', v_today_total);
  END IF;

  -- 4. Check cooldown
  SELECT MAX(mined_at) INTO v_last_mine
  FROM public.fm_mining_logs
  WHERE user_id = p_user_id
    AND activity_type = p_activity_type;

  IF v_last_mine IS NOT NULL AND v_last_mine > now() - (v_rule.cooldown_minutes || ' minutes')::interval THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cooldown active', 'retry_after', v_last_mine + (v_rule.cooldown_minutes || ' minutes')::interval);
  END IF;

  -- 5. Calculate reward (capped to not exceed daily max)
  DECLARE v_reward integer;
  BEGIN
    v_reward := LEAST(v_rule.base_reward, v_rule.max_daily - v_today_total);
    IF v_reward <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily cap reached');
    END IF;

    -- 6. Post transaction via fm_post_transaction
    SELECT public.fm_post_transaction(
      p_user_id := p_user_id,
      p_type := 'mining_reward',
      p_amount := v_reward,
      p_description := 'Mining: ' || p_activity_type,
      p_reference_type := COALESCE(p_source_table, p_activity_type),
      p_idempotency_key := v_idem_key,
      p_metadata := p_metadata
    ) INTO v_tx_result;

    IF NOT (v_tx_result->>'success')::boolean THEN
      RETURN v_tx_result;
    END IF;

    -- 7. Log mining event
    INSERT INTO public.fm_mining_logs (user_id, rule_id, activity_type, mos_awarded, source_table, source_id, idempotency_key, metadata)
    VALUES (p_user_id, v_rule.id, p_activity_type, v_reward, p_source_table, p_source_id, v_idem_key, p_metadata);

    RETURN jsonb_build_object(
      'success', true,
      'mos_awarded', v_reward,
      'activity', p_activity_type,
      'daily_total', v_today_total + v_reward,
      'daily_cap', v_rule.max_daily
    );
  END;
END;
$$;
