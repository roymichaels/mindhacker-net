/**
 * Web3Auth helpers for Supabase session bridging.
 *
 * The Web3Auth SDK is now managed by Web3AuthProvider (React context).
 * This file only contains the Supabase bridge logic.
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Exchanges the Web3Auth identity for a Supabase session.
 * Called after successful Web3Auth login to bridge into Supabase RLS.
 */
export async function exchangeForSupabaseSession(userInfo: {
  email: string;
  name?: string;
  idToken?: string;
}) {
  const { data, error } = await supabase.functions.invoke('web3auth-exchange', {
    body: {
      action: 'exchange',
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
      idToken: userInfo.idToken,
    },
  });

  if (error) throw new Error(error.message || 'Token exchange failed');
  if (!data?.otp) throw new Error(data?.error || 'No session token received');

  const { data: authData, error: authError } = await supabase.auth.verifyOtp({
    email: userInfo.email,
    token: data.otp,
    type: 'email',
  });

  if (authError) throw authError;
  return authData;
}
