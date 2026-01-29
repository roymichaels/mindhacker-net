-- Create aurora_award_xp as an alias for backward compatibility
CREATE OR REPLACE FUNCTION aurora_award_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Call the unified XP function with 'aurora' as the source
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;