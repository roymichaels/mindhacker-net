/**
 * Wallet status service — Phase 2 Batch 3 (read-only).
 */
import { supabase } from '@/integrations/supabase/client';

export async function getWalletStatus(userId: string): Promise<{
  text: string;
  wallet: any | null;
  recent: any[];
}> {
  if (!userId) return { text: 'אין משתמש.', wallet: null, recent: [] };
  const { data: wallet } = await supabase
    .from('fm_wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  const { data: recent } = await supabase
    .from('fm_transactions')
    .select('id, amount_mos, kind, created_at, description')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  const balance = (wallet as any)?.balance_mos ?? (wallet as any)?.balance ?? 0;
  const text = wallet
    ? `יתרת ארנק: ${balance} MOS · ${recent?.length ?? 0} פעולות אחרונות`
    : 'אין עדיין ארנק. נפתח אוטומטית בפעם הראשונה.';
  return { text, wallet, recent: recent ?? [] };
}