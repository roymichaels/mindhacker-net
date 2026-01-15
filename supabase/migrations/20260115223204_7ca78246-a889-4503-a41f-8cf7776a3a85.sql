-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  payment_method TEXT CHECK (payment_method IN ('paypal', 'bank_transfer', 'bit', 'paybox')),
  payment_details JSONB,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_referrals table
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create affiliate_payouts table
CREATE TABLE public.affiliate_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add affiliate_code column to orders table
ALTER TABLE public.orders ADD COLUMN affiliate_code TEXT;

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliates
CREATE POLICY "Users can view their own affiliate profile" 
ON public.affiliates FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own affiliate profile" 
ON public.affiliates FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert affiliate profile" 
ON public.affiliates FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all affiliates" 
ON public.affiliates FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate_referrals
CREATE POLICY "Affiliates can view their own referrals" 
ON public.affiliate_referrals FOR SELECT 
USING (
  affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all referrals" 
ON public.affiliate_referrals FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate_payouts
CREATE POLICY "Affiliates can view their own payouts" 
ON public.affiliate_payouts FOR SELECT 
USING (
  affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all payouts" 
ON public.affiliate_payouts FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create function to update affiliate earnings when referral is approved
CREATE OR REPLACE FUNCTION public.update_affiliate_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.affiliates 
    SET total_earnings = total_earnings + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  ELSIF NEW.status = 'paid' AND OLD.status = 'approved' THEN
    UPDATE public.affiliates 
    SET total_paid = total_paid + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updating affiliate earnings
CREATE TRIGGER on_referral_status_change
  AFTER UPDATE ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_earnings();

-- Create trigger for updated_at on affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add notification type for affiliate events
-- Note: This requires adding to the enum if not exists
DO $$
BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_affiliate';
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'affiliate_referral';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;