-- Add affiliate_code column to leads table for tracking referrals from affiliate partners
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS affiliate_code TEXT;

-- Add index for faster affiliate lookups
CREATE INDEX IF NOT EXISTS idx_leads_affiliate_code ON public.leads(affiliate_code) WHERE affiliate_code IS NOT NULL;

-- Add affiliate_code column to consciousness_leap_leads table
ALTER TABLE public.consciousness_leap_leads ADD COLUMN IF NOT EXISTS affiliate_code TEXT;

-- Add index for faster affiliate lookups
CREATE INDEX IF NOT EXISTS idx_consciousness_leap_leads_affiliate_code ON public.consciousness_leap_leads(affiliate_code) WHERE affiliate_code IS NOT NULL;