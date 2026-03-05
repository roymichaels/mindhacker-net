-- fm_claim_bounty: User claims a bounty (race-safe)
CREATE OR REPLACE FUNCTION public.fm_claim_bounty(p_bounty_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_bounty RECORD;
  v_existing_id uuid;
  v_claim_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Lock bounty row
  SELECT * INTO v_bounty
  FROM public.fm_bounties
  WHERE id = p_bounty_id
  FOR UPDATE;

  IF v_bounty IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty not found');
  END IF;

  IF v_bounty.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty is not active');
  END IF;

  IF v_bounty.expires_at IS NOT NULL AND v_bounty.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty has expired');
  END IF;

  IF v_bounty.active_claims >= v_bounty.max_claims THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty is full');
  END IF;

  -- Check duplicate: user already has a non-rejected claim
  SELECT id INTO v_existing_id
  FROM public.fm_bounty_claims
  WHERE bounty_id = p_bounty_id AND user_id = v_user_id AND status != 'rejected';

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed', 'claim_id', v_existing_id);
  END IF;

  -- Create claim
  INSERT INTO public.fm_bounty_claims (bounty_id, user_id, status)
  VALUES (p_bounty_id, v_user_id, 'claimed')
  RETURNING id INTO v_claim_id;

  -- Increment active_claims
  UPDATE public.fm_bounties
  SET active_claims = active_claims + 1, updated_at = now()
  WHERE id = p_bounty_id;

  RETURN jsonb_build_object('success', true, 'claim_id', v_claim_id);
END;
$$;

-- fm_submit_bounty_claim: User submits work for a claim
CREATE OR REPLACE FUNCTION public.fm_submit_bounty_claim(p_claim_id uuid, p_submission jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_claim RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_claim
  FROM public.fm_bounty_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF v_claim IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  IF v_claim.user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your claim');
  END IF;

  IF v_claim.status NOT IN ('claimed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim cannot be submitted in current status: ' || v_claim.status);
  END IF;

  UPDATE public.fm_bounty_claims
  SET status = 'pending', submission_data = p_submission, updated_at = now()
  WHERE id = p_claim_id;

  RETURN jsonb_build_object('success', true, 'claim_id', p_claim_id);
END;
$$;

-- fm_approve_bounty_claim: Admin approves a claim and pays out
CREATE OR REPLACE FUNCTION public.fm_approve_bounty_claim(p_claim_id uuid, p_action text DEFAULT 'approve')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_claim RECORD;
  v_bounty RECORD;
  v_tx_result jsonb;
  v_idempotency_key text;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify admin role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
  END IF;

  IF p_action NOT IN ('approve', 'reject') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Action must be approve or reject');
  END IF;

  SELECT * INTO v_claim
  FROM public.fm_bounty_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF v_claim IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  IF v_claim.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim is not pending review');
  END IF;

  SELECT * INTO v_bounty
  FROM public.fm_bounties
  WHERE id = v_claim.bounty_id;

  IF p_action = 'reject' THEN
    UPDATE public.fm_bounty_claims
    SET status = 'rejected', reviewed_at = now(), reviewed_by = v_admin_id, updated_at = now()
    WHERE id = p_claim_id;

    -- Decrement active_claims
    UPDATE public.fm_bounties
    SET active_claims = GREATEST(0, active_claims - 1), updated_at = now()
    WHERE id = v_claim.bounty_id;

    RETURN jsonb_build_object('success', true, 'action', 'rejected');
  END IF;

  -- Approve: pay MOS
  v_idempotency_key := 'bounty_claim_' || p_claim_id::text;

  v_tx_result := fm_post_transaction(
    p_user_id := v_claim.user_id,
    p_type := 'earn_bounty',
    p_amount := v_bounty.reward_mos,
    p_description := 'Bounty: ' || v_bounty.title,
    p_reference_type := 'bounty_claim',
    p_reference_id := p_claim_id,
    p_idempotency_key := v_idempotency_key
  );

  IF NOT (v_tx_result->>'success')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', v_tx_result->>'error');
  END IF;

  UPDATE public.fm_bounty_claims
  SET status = 'approved',
      reviewed_at = now(),
      reviewed_by = v_admin_id,
      transaction_id = (v_tx_result->>'transaction_id')::uuid,
      updated_at = now()
  WHERE id = p_claim_id;

  -- Update bounty counters
  UPDATE public.fm_bounties
  SET completed_claims = completed_claims + 1,
      active_claims = GREATEST(0, active_claims - 1),
      updated_at = now()
  WHERE id = v_claim.bounty_id;

  RETURN jsonb_build_object(
    'success', true,
    'action', 'approved',
    'mos_paid', v_bounty.reward_mos,
    'new_balance', v_tx_result->>'new_balance',
    'transaction_id', v_tx_result->>'transaction_id'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fm_claim_bounty(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fm_submit_bounty_claim(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fm_approve_bounty_claim(uuid, text) TO authenticated;

-- Add UPDATE policy for claims (users can update their own claimed->pending)
CREATE POLICY "Users update own claims"
ON public.fm_bounty_claims
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());