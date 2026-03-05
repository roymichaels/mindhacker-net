
-- ============================================
-- Phase 2: Data Marketplace Backend Schema
-- ============================================

-- 1. Data Listings — what anonymized datasets are available for purchase
CREATE TABLE public.fm_data_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL, -- sleep_patterns, habit_trends, mood_signals, training_results
  sample_schema jsonb DEFAULT '{}',
  data_points_count integer DEFAULT 0,
  contributor_count integer DEFAULT 0,
  price_mos integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'active', -- active, paused, archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_data_listings ENABLE ROW LEVEL SECURITY;

-- Public read for buyers
CREATE POLICY "Anyone can view active listings"
  ON public.fm_data_listings FOR SELECT
  USING (status = 'active');

-- 2. Data Snapshots — anonymized, aggregated exports ready for buyers
CREATE TABLE public.fm_data_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.fm_data_listings(id) ON DELETE CASCADE,
  category text NOT NULL,
  snapshot_data jsonb NOT NULL DEFAULT '{}',
  contributor_count integer NOT NULL DEFAULT 0,
  data_points integer NOT NULL DEFAULT 0,
  date_range_start date,
  date_range_end date,
  quality_score numeric(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.fm_data_snapshots ENABLE ROW LEVEL SECURITY;

-- Only accessible via service role (edge functions)
CREATE POLICY "No direct access to snapshots"
  ON public.fm_data_snapshots FOR SELECT
  USING (false);

-- 3. Data Purchases — buyer transactions
CREATE TABLE public.fm_data_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL, -- could be external buyer or internal user
  buyer_email text,
  buyer_org text,
  listing_id uuid REFERENCES public.fm_data_listings(id),
  snapshot_id uuid REFERENCES public.fm_data_snapshots(id),
  price_mos integer NOT NULL,
  price_usd numeric(10,2),
  status text NOT NULL DEFAULT 'pending', -- pending, completed, refunded
  access_token text UNIQUE, -- one-time download token
  access_expires_at timestamptz,
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_data_purchases ENABLE ROW LEVEL SECURITY;

-- No direct client access — managed via edge functions
CREATE POLICY "No direct access to purchases"
  ON public.fm_data_purchases FOR SELECT
  USING (false);

-- 4. Data Revenue Share — tracks how contributor MOS is distributed
CREATE TABLE public.fm_data_revenue_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES public.fm_data_purchases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  category text NOT NULL,
  share_mos integer NOT NULL DEFAULT 0,
  transaction_id uuid, -- links to fm_transactions
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_data_revenue_shares ENABLE ROW LEVEL SECURITY;

-- Users can see their own revenue shares
CREATE POLICY "Users see own revenue shares"
  ON public.fm_data_revenue_shares FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Updated_at triggers
CREATE TRIGGER set_updated_at_fm_data_listings
  BEFORE UPDATE ON public.fm_data_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Function to generate anonymized snapshot from contributor data
CREATE OR REPLACE FUNCTION public.fm_generate_snapshot(
  p_category text,
  p_listing_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot_id uuid;
  v_contributor_count integer;
  v_data_points integer;
  v_snapshot_data jsonb;
  v_start_date date;
  v_end_date date;
BEGIN
  v_end_date := CURRENT_DATE;
  v_start_date := v_end_date - INTERVAL '30 days';

  -- Count active contributors for this category
  SELECT COUNT(DISTINCT dc.user_id)
  INTO v_contributor_count
  FROM fm_data_consent dc
  WHERE dc.category = p_category
    AND dc.is_opted_in = true;

  -- Minimum privacy threshold: need at least 10 contributors
  IF v_contributor_count < 10 THEN
    RAISE EXCEPTION 'Insufficient contributors (%) for category %. Minimum 10 required.', v_contributor_count, p_category;
  END IF;

  -- Generate anonymized aggregate data based on category
  IF p_category = 'sleep_patterns' THEN
    SELECT jsonb_build_object(
      'avg_session_duration_seconds', COALESCE(AVG(hs.duration_seconds), 0),
      'total_sessions', COUNT(hs.id),
      'avg_sessions_per_user', COUNT(hs.id)::numeric / NULLIF(v_contributor_count, 0),
      'completion_rate', COUNT(*) FILTER (WHERE hs.duration_seconds > 60)::numeric / NULLIF(COUNT(*), 0),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(hs.id)
    INTO v_snapshot_data, v_data_points
    FROM hypnosis_sessions hs
    JOIN fm_data_consent dc ON dc.user_id = hs.user_id AND dc.category = 'sleep_patterns' AND dc.is_opted_in = true
    WHERE hs.created_at >= v_start_date;

  ELSIF p_category = 'habit_trends' THEN
    SELECT jsonb_build_object(
      'total_habits_tracked', COUNT(ai.id),
      'avg_completion_rate', COUNT(*) FILTER (WHERE ai.status = 'done')::numeric / NULLIF(COUNT(*), 0),
      'top_pillars', (
        SELECT jsonb_agg(jsonb_build_object('pillar', sub.pillar, 'count', sub.cnt))
        FROM (SELECT pillar, COUNT(*) as cnt FROM action_items WHERE type = 'habit' AND pillar IS NOT NULL GROUP BY pillar ORDER BY cnt DESC LIMIT 5) sub
      ),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(ai.id)
    INTO v_snapshot_data, v_data_points
    FROM action_items ai
    JOIN fm_data_consent dc ON dc.user_id = ai.user_id AND dc.category = 'habit_trends' AND dc.is_opted_in = true
    WHERE ai.type = 'habit' AND ai.created_at >= v_start_date;

  ELSIF p_category = 'mood_signals' THEN
    SELECT jsonb_build_object(
      'avg_energy_entries', COUNT(aop.id),
      'energy_distribution', jsonb_build_object(
        'high', COUNT(*) FILTER (WHERE aop.energy_level = 'high'),
        'medium', COUNT(*) FILTER (WHERE aop.energy_level = 'medium'),
        'low', COUNT(*) FILTER (WHERE aop.energy_level = 'low')
      ),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(aop.id)
    INTO v_snapshot_data, v_data_points
    FROM aurora_onboarding_progress aop
    JOIN fm_data_consent dc ON dc.user_id = aop.user_id AND dc.category = 'mood_signals' AND dc.is_opted_in = true
    WHERE aop.updated_at >= v_start_date;

  ELSIF p_category = 'training_results' THEN
    SELECT jsonb_build_object(
      'total_lessons_completed', COUNT(ll.id),
      'avg_xp_per_lesson', COALESCE(AVG(ll.xp_reward), 0),
      'completion_distribution', jsonb_build_object(
        'completed', COUNT(*) FILTER (WHERE ll.status = 'completed'),
        'in_progress', COUNT(*) FILTER (WHERE ll.status = 'active'),
        'locked', COUNT(*) FILTER (WHERE ll.status = 'locked')
      ),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(ll.id)
    INTO v_snapshot_data, v_data_points
    FROM learning_lessons ll
    JOIN fm_data_consent dc ON dc.user_id = ll.user_id AND dc.category = 'training_results' AND dc.is_opted_in = true
    WHERE ll.created_at >= v_start_date;

  ELSE
    RAISE EXCEPTION 'Unknown category: %', p_category;
  END IF;

  -- Insert snapshot
  INSERT INTO fm_data_snapshots (listing_id, category, snapshot_data, contributor_count, data_points, date_range_start, date_range_end, quality_score, expires_at)
  VALUES (p_listing_id, p_category, v_snapshot_data, v_contributor_count, v_data_points,
    v_start_date, v_end_date,
    LEAST(1.0, (v_contributor_count::numeric / 100) * (v_data_points::numeric / 1000)),
    now() + INTERVAL '90 days'
  ) RETURNING id INTO v_snapshot_id;

  -- Update listing stats if linked
  IF p_listing_id IS NOT NULL THEN
    UPDATE fm_data_listings
    SET data_points_count = v_data_points,
        contributor_count = v_contributor_count,
        updated_at = now()
    WHERE id = p_listing_id;
  END IF;

  RETURN v_snapshot_id;
END;
$$;

-- 7. Function to distribute revenue to contributors after a purchase
CREATE OR REPLACE FUNCTION public.fm_distribute_revenue(
  p_purchase_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category text;
  v_total_mos integer;
  v_contributor_count integer;
  v_share_per_user integer;
  v_user record;
  v_paid_count integer := 0;
BEGIN
  -- Get purchase details
  SELECT dl.category, dp.price_mos
  INTO v_category, v_total_mos
  FROM fm_data_purchases dp
  JOIN fm_data_listings dl ON dl.id = dp.listing_id
  WHERE dp.id = p_purchase_id AND dp.status = 'completed';

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Purchase not found or not completed';
  END IF;

  -- Platform takes 20%, 80% goes to contributors
  v_total_mos := (v_total_mos * 80) / 100;

  -- Get active contributors
  SELECT COUNT(*) INTO v_contributor_count
  FROM fm_data_consent
  WHERE category = v_category AND is_opted_in = true;

  IF v_contributor_count = 0 THEN RETURN 0; END IF;

  v_share_per_user := GREATEST(1, v_total_mos / v_contributor_count);

  -- Distribute to each contributor
  FOR v_user IN
    SELECT user_id FROM fm_data_consent
    WHERE category = v_category AND is_opted_in = true
  LOOP
    -- Post transaction to user's wallet
    PERFORM fm_post_transaction(
      v_user.user_id,
      'earn'::fm_tx_type,
      v_share_per_user,
      'Data marketplace revenue: ' || v_category,
      'data_purchase',
      p_purchase_id,
      'data_rev_' || p_purchase_id || '_' || v_user.user_id
    );

    -- Record revenue share
    INSERT INTO fm_data_revenue_shares (purchase_id, user_id, category, share_mos, paid_at)
    VALUES (p_purchase_id, v_user.user_id, v_category, v_share_per_user, now());

    v_paid_count := v_paid_count + 1;
  END LOOP;

  RETURN v_paid_count;
END;
$$;
