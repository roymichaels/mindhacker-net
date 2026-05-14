/**
 * Subscription status service — Phase 2 Batch 3 (read-only).
 * Reads `profiles.subscription_tier`; live Stripe verification is delegated
 * to the `check-subscription` edge function from existing UI flows.
 */
import { supabase } from '@/integrations/supabase/client';

export async function getSubscriptionStatus(userId: string): Promise<{
  text: string;
  tier: string | null;
  active: boolean;
}> {
  if (!userId) return { text: 'אין משתמש.', tier: null, active: false };
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle();
  const tier = (data as any)?.subscription_tier ?? 'free';
  const active = tier && tier !== 'free';
  return {
    text: active
      ? `מנוי פעיל · ${tier}${(data as any)?.subscription_expires_at ? ` · בתוקף עד ${String((data as any).subscription_expires_at).slice(0, 10)}` : ''}`
      : 'אין מנוי פעיל. אפשר לשדרג בכל עת.',
    tier,
    active: !!active,
  };
}