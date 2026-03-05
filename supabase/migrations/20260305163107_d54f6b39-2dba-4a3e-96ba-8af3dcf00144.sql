
-- Add mining_reward to fm_tx_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'mining_reward' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fm_tx_type')) THEN
    ALTER TYPE public.fm_tx_type ADD VALUE 'mining_reward';
  END IF;
END$$;
