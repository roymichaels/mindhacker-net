
-- 1. Add fee tracking columns to fm_transactions
ALTER TABLE public.fm_transactions 
  ADD COLUMN IF NOT EXISTS fee_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount numeric DEFAULT 0;

-- 2. Add lifetime_fees and pending_balance to fm_wallets
ALTER TABLE public.fm_wallets 
  ADD COLUMN IF NOT EXISTS lifetime_fees numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance numeric DEFAULT 0;

-- 3. Add data_contribution_enabled to fm_wallets for easy toggle
ALTER TABLE public.fm_wallets 
  ADD COLUMN IF NOT EXISTS data_contribution_enabled boolean DEFAULT false;

-- 4. Create the fee-aware spend function
CREATE OR REPLACE FUNCTION public.fm_spend_mos(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_seller_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet RECORD;
  v_fee numeric;
  v_net numeric;
  v_treasury_share numeric;
  v_rewards_share numeric;
  v_reserve_share numeric;
  v_new_balance numeric;
  v_tx_id uuid;
  v_seller_result jsonb;
  v_existing jsonb;
BEGIN
  -- Validate
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'transaction_id', id,
      'idempotent', true
    ) INTO v_existing
    FROM fm_transactions
    WHERE idempotency_key = p_idempotency_key;
    IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;
  END IF;

  -- Lock wallet
  SELECT * INTO v_wallet
  FROM fm_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF v_wallet.mos_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient MOS balance', 'current_balance', v_wallet.mos_balance, 'required', p_amount);
  END IF;

  -- Calculate 2% fee
  v_fee := ROUND(p_amount * 0.02, 2);
  v_net := p_amount - v_fee;

  -- Fee split: 50% treasury, 25% rewards, 25% reserve
  v_treasury_share := ROUND(v_fee * 0.50, 2);
  v_rewards_share := ROUND(v_fee * 0.25, 2);
  v_reserve_share := v_fee - v_treasury_share - v_rewards_share;

  -- Deduct from buyer
  v_new_balance := v_wallet.mos_balance - p_amount;
  UPDATE fm_wallets
  SET mos_balance = v_new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      lifetime_fees = COALESCE(lifetime_fees, 0) + v_fee,
      updated_at = now()
  WHERE id = v_wallet.id;

  -- Record buyer transaction
  INSERT INTO fm_transactions (user_id, wallet_id, type, amount, fee_amount, net_amount, balance_after, description, reference_type, reference_id, idempotency_key, status, metadata)
  VALUES (p_user_id, v_wallet.id, 'spend_purchase', -p_amount, v_fee, -v_net, v_new_balance, p_description, p_reference_type, p_reference_id, p_idempotency_key, 'completed',
    jsonb_build_object(
      'fee_breakdown', jsonb_build_object('total_fee', v_fee, 'treasury', v_treasury_share, 'rewards', v_rewards_share, 'reserve', v_reserve_share),
      'gross_amount', p_amount,
      'seller_id', p_seller_id
    )
  )
  RETURNING id INTO v_tx_id;

  -- Credit seller if specified
  IF p_seller_id IS NOT NULL THEN
    v_seller_result := fm_post_transaction(
      p_user_id := p_seller_id,
      p_type := 'earn_gig',
      p_amount := v_net,
      p_description := 'Sale: ' || COALESCE(p_description, 'Service'),
      p_reference_type := 'purchase',
      p_reference_id := v_tx_id::text,
      p_idempotency_key := COALESCE(p_idempotency_key, '') || '_seller'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'gross_amount', p_amount,
    'fee', v_fee,
    'net_to_seller', v_net,
    'new_balance', v_new_balance,
    'fee_breakdown', jsonb_build_object('treasury', v_treasury_share, 'rewards', v_rewards_share, 'reserve', v_reserve_share)
  );
END;
$$;
