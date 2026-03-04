
-- ═══════════════════════════════════════════════════════════
-- FM (Free Market) Schema — Core Tables, Enums, Functions, RLS
-- ═══════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────
CREATE TYPE public.fm_wallet_mode AS ENUM ('simple', 'advanced');
CREATE TYPE public.fm_tx_type AS ENUM (
  'earn_bounty', 'earn_gig', 'earn_data', 'earn_reward',
  'spend_purchase', 'escrow_hold', 'escrow_release', 'escrow_refund',
  'withdraw_fiat', 'withdraw_crypto', 'deposit', 'adjustment'
);
CREATE TYPE public.fm_tx_status AS ENUM ('completed', 'pending', 'failed');
CREATE TYPE public.fm_bounty_status AS ENUM ('active', 'paused', 'completed', 'expired');
CREATE TYPE public.fm_gig_status AS ENUM ('draft', 'open', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.fm_settlement_channel AS ENUM ('stripe', 'moonpay', 'solana', 'internal');
CREATE TYPE public.fm_settlement_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ─── 1. fm_wallets ───────────────────────────────────────
CREATE TABLE public.fm_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  mos_balance integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  mode fm_wallet_mode NOT NULL DEFAULT 'simple',
  solana_address text,
  solana_pubkey_encrypted text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_wallets_user ON public.fm_wallets(user_id);

ALTER TABLE public.fm_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own wallet"
  ON public.fm_wallets FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own wallet mode"
  ON public.fm_wallets FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 2. fm_transactions (append-only ledger) ────────────
CREATE TABLE public.fm_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.fm_wallets(id),
  user_id uuid NOT NULL,
  type fm_tx_type NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  status fm_tx_status NOT NULL DEFAULT 'completed',
  reference_type text,
  reference_id uuid,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_tx_wallet ON public.fm_transactions(wallet_id);
CREATE INDEX idx_fm_tx_user ON public.fm_transactions(user_id);
CREATE INDEX idx_fm_tx_created ON public.fm_transactions(created_at DESC);
CREATE INDEX idx_fm_tx_ref ON public.fm_transactions(reference_type, reference_id);

ALTER TABLE public.fm_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions"
  ON public.fm_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ─── 3. fm_bounties ─────────────────────────────────────
CREATE TABLE public.fm_bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  reward_mos integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'easy',
  estimated_minutes integer,
  max_claims integer NOT NULL DEFAULT 1,
  active_claims integer NOT NULL DEFAULT 0,
  completed_claims integer NOT NULL DEFAULT 0,
  status fm_bounty_status NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_bounties_status ON public.fm_bounties(status);

ALTER TABLE public.fm_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read active bounties"
  ON public.fm_bounties FOR SELECT TO authenticated
  USING (true);

-- ─── 4. fm_bounty_claims ────────────────────────────────
CREATE TABLE public.fm_bounty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid NOT NULL REFERENCES public.fm_bounties(id),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  submission_data jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  transaction_id uuid REFERENCES public.fm_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bounty_id, user_id)
);

CREATE INDEX idx_fm_claims_user ON public.fm_bounty_claims(user_id);
CREATE INDEX idx_fm_claims_bounty ON public.fm_bounty_claims(bounty_id);

ALTER TABLE public.fm_bounty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own claims"
  ON public.fm_bounty_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own claims"
  ON public.fm_bounty_claims FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─── 5. fm_gigs ─────────────────────────────────────────
CREATE TABLE public.fm_gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  budget_mos integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status fm_gig_status NOT NULL DEFAULT 'draft',
  accepted_proposal_id uuid,
  deliverable_url text,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_gigs_poster ON public.fm_gigs(poster_id);
CREATE INDEX idx_fm_gigs_status ON public.fm_gigs(status);

ALTER TABLE public.fm_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read open gigs"
  ON public.fm_gigs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users create own gigs"
  ON public.fm_gigs FOR INSERT TO authenticated
  WITH CHECK (poster_id = auth.uid());

CREATE POLICY "Users update own gigs"
  ON public.fm_gigs FOR UPDATE TO authenticated
  USING (poster_id = auth.uid())
  WITH CHECK (poster_id = auth.uid());

-- ─── 6. fm_gig_proposals ────────────────────────────────
CREATE TABLE public.fm_gig_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES public.fm_gigs(id),
  user_id uuid NOT NULL,
  pitch text,
  proposed_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gig_id, user_id)
);

CREATE INDEX idx_fm_proposals_gig ON public.fm_gig_proposals(gig_id);
CREATE INDEX idx_fm_proposals_user ON public.fm_gig_proposals(user_id);

ALTER TABLE public.fm_gig_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own proposals or proposals on own gigs"
  ON public.fm_gig_proposals FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR gig_id IN (SELECT id FROM public.fm_gigs WHERE poster_id = auth.uid())
  );

CREATE POLICY "Users create own proposals"
  ON public.fm_gig_proposals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own proposals"
  ON public.fm_gig_proposals FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 7. fm_data_contributions ───────────────────────────
CREATE TABLE public.fm_data_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data_type text NOT NULL,
  days_shared integer NOT NULL,
  reward_mos integer NOT NULL,
  status text NOT NULL DEFAULT 'active',
  consent_hash text NOT NULL,
  transaction_id uuid REFERENCES public.fm_transactions(id),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_data_user ON public.fm_data_contributions(user_id);

ALTER TABLE public.fm_data_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own contributions"
  ON public.fm_data_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own contributions"
  ON public.fm_data_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users revoke own contributions"
  ON public.fm_data_contributions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 8. fm_settlement_outbox ────────────────────────────
CREATE TABLE public.fm_settlement_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.fm_transactions(id),
  user_id uuid NOT NULL,
  channel fm_settlement_channel NOT NULL,
  amount_mos integer NOT NULL,
  amount_fiat_cents integer,
  external_ref text,
  status fm_settlement_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_settle_status ON public.fm_settlement_outbox(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_fm_settle_user ON public.fm_settlement_outbox(user_id);

ALTER TABLE public.fm_settlement_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own settlements"
  ON public.fm_settlement_outbox FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ─── Core Function: fm_post_transaction ─────────────────
CREATE OR REPLACE FUNCTION public.fm_post_transaction(
  p_user_id uuid,
  p_type fm_tx_type,
  p_amount integer,
  p_description text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_status fm_tx_status DEFAULT 'completed'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_current_balance integer;
  v_new_balance integer;
  v_tx_id uuid;
  v_existing jsonb;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'transaction_id', id,
      'new_balance', balance_after,
      'idempotent', true
    ) INTO v_existing
    FROM public.fm_transactions
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Lock wallet row
  SELECT id, mos_balance INTO v_wallet_id, v_current_balance
  FROM public.fm_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Prevent negative balance
  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient MOS balance',
      'current_balance', v_current_balance,
      'requested', p_amount
    );
  END IF;

  -- Insert transaction
  INSERT INTO public.fm_transactions (
    wallet_id, user_id, type, amount, balance_after, status,
    reference_type, reference_id, description, metadata, idempotency_key
  ) VALUES (
    v_wallet_id, p_user_id, p_type, p_amount, v_new_balance, p_status,
    p_reference_type, p_reference_id, p_description, p_metadata, p_idempotency_key
  ) RETURNING id INTO v_tx_id;

  -- Update wallet balance + lifetime counters
  UPDATE public.fm_wallets
  SET
    mos_balance = v_new_balance,
    lifetime_earned = CASE WHEN p_amount > 0 THEN lifetime_earned + p_amount ELSE lifetime_earned END,
    lifetime_spent = CASE WHEN p_amount < 0 THEN lifetime_spent + ABS(p_amount) ELSE lifetime_spent END,
    updated_at = now()
  WHERE id = v_wallet_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'new_balance', v_new_balance,
    'amount', p_amount
  );
END;
$$;

-- ─── Auto-create wallet on profile creation ─────────────
CREATE OR REPLACE FUNCTION public.fm_auto_create_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fm_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_auto_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fm_auto_create_wallet();

-- ─── Updated_at triggers ────────────────────────────────
CREATE TRIGGER trg_fm_wallets_updated
  BEFORE UPDATE ON public.fm_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_bounties_updated
  BEFORE UPDATE ON public.fm_bounties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_gigs_updated
  BEFORE UPDATE ON public.fm_gigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_gig_proposals_updated
  BEFORE UPDATE ON public.fm_gig_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_bounty_claims_updated
  BEFORE UPDATE ON public.fm_bounty_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_settlement_updated
  BEFORE UPDATE ON public.fm_settlement_outbox
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
