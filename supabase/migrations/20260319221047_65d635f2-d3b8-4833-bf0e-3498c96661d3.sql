
-- Soul Wallets table for Web3 wallet + NFT mint tracking
CREATE TABLE public.soul_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_address TEXT,
  wallet_provider TEXT DEFAULT 'web3auth',
  is_minted BOOLEAN NOT NULL DEFAULT false,
  minted_at TIMESTAMPTZ,
  nft_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.soul_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own soul wallet"
  ON public.soul_wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own soul wallet"
  ON public.soul_wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own soul wallet"
  ON public.soul_wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-update timestamp
CREATE TRIGGER update_soul_wallets_updated_at
  BEFORE UPDATE ON public.soul_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
