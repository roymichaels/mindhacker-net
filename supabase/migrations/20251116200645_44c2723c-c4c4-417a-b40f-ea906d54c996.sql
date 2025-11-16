-- Add booking and payment tracking fields to purchases table
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'scheduled', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS booking_notes TEXT,
ADD COLUMN IF NOT EXISTS booking_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Update existing payment_status values from 'demo' to 'pending_session'
UPDATE public.purchases 
SET payment_status = 'pending_session' 
WHERE payment_status = 'demo';

-- Add comment for clarity
COMMENT ON COLUMN public.purchases.booking_status IS 'Tracks booking lifecycle: pending (not scheduled), scheduled (time confirmed), completed (session done), cancelled';
COMMENT ON COLUMN public.purchases.payment_status IS 'Tracks payment lifecycle: pending_session (not yet paid), completed (paid), cancelled';
COMMENT ON COLUMN public.purchases.payment_method IS 'Set after payment: paypal, bank_transfer, cash, etc';