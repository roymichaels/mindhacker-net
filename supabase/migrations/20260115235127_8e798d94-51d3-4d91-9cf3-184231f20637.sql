-- Trigger function to create affiliate referral when order payment is approved
CREATE OR REPLACE FUNCTION create_affiliate_referral_on_payment_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_affiliate_id uuid;
  v_commission_rate numeric;
  v_existing_referral_id uuid;
BEGIN
  -- Only trigger when payment_status changes to 'completed'
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') AND NEW.affiliate_code IS NOT NULL THEN
    -- Check if referral already exists for this order
    SELECT id INTO v_existing_referral_id
    FROM affiliate_referrals
    WHERE order_id = NEW.id;
    
    -- Only create if no existing referral
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trg_create_affiliate_referral ON orders;
CREATE TRIGGER trg_create_affiliate_referral
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_affiliate_referral_on_payment_approval();