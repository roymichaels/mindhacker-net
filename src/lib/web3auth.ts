/**
 * Web3Auth helpers for backend session bridging.
 *
 * The Web3Auth SDK is managed by Web3AuthProvider (React context).
 * This file only contains the backend bridge logic.
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Exchanges the Web3Auth identity for a backend-authenticated session.
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

  // Some environments treat admin.generateLink(type="magiclink") OTP as magiclink,
  // others accept it as email OTP. Try magiclink first, then fallback.
  let authData: unknown;
  let authError: Error | null = null;

  const magicLinkResult = await supabase.auth.verifyOtp({
    email: userInfo.email,
    token: data.otp,
    type: 'magiclink',
  });

  authData = magicLinkResult.data;
  authError = magicLinkResult.error;

  if (authError) {
    const emailOtpResult = await supabase.auth.verifyOtp({
      email: userInfo.email,
      token: data.otp,
      type: 'email',
    });

    authData = emailOtpResult.data;
    authError = emailOtpResult.error;
  }

  if (authError) throw authError;
  return authData;
}
