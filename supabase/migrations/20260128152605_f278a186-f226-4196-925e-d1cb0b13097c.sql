-- Fix function search_path for update_chat_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_chat_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function search_path for create_affiliate_referral_on_payment (SECURITY DEFINER needs search_path)
CREATE OR REPLACE FUNCTION public.create_affiliate_referral_on_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_affiliate_id uuid;
  v_commission_rate numeric;
  v_existing_referral_id uuid;
  v_should_process boolean := false;
BEGIN
  -- Check if we should process this event
  IF TG_OP = 'INSERT' THEN
    -- For INSERT, process if payment is already completed and has affiliate code
    v_should_process := (NEW.payment_status = 'completed' AND NEW.affiliate_code IS NOT NULL);
  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, process if payment_status changed to 'completed' and has affiliate code
    v_should_process := (NEW.payment_status = 'completed' 
                         AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') 
                         AND NEW.affiliate_code IS NOT NULL);
  END IF;

  IF v_should_process THEN
    -- Check if referral already exists for this order
    SELECT id INTO v_existing_referral_id
    FROM affiliate_referrals 
    WHERE order_id = NEW.id;
    
    IF v_existing_referral_id IS NULL THEN
      -- Get affiliate info
      SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
      FROM affiliates
      WHERE affiliate_code = NEW.affiliate_code AND status = 'active';
      
      IF v_affiliate_id IS NOT NULL THEN
        -- Create referral record
        INSERT INTO affiliate_referrals (
          affiliate_id,
          referred_user_id,
          order_id,
          order_amount,
          commission_amount,
          status,
          approved_at
        ) VALUES (
          v_affiliate_id,
          NEW.user_id,
          NEW.id,
          NEW.amount,
          (NEW.amount * v_commission_rate / 100),
          'approved',
          now()
        );
        
        -- Update affiliate total earnings
        UPDATE affiliates
        SET total_earnings = total_earnings + (NEW.amount * v_commission_rate / 100),
            updated_at = now()
        WHERE id = v_affiliate_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;