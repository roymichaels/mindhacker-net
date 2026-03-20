/**
 * Web3Auth integration (v10 — unified @web3auth/modal).
 * Lazy-loads the SDK to keep the main bundle small.
 * After Web3Auth authenticates, bridges to Supabase via the
 * web3auth-exchange edge function so all RLS/data access stays intact.
 */
import { supabase } from '@/integrations/supabase/client';

let web3authInstance: any = null;
let initPromise: Promise<any> | null = null;

/* ------------------------------------------------------------------ */
/*  Lazy SDK loader + init                                            */
/* ------------------------------------------------------------------ */

async function loadAndInit() {
  const { Web3Auth, WEB3AUTH_NETWORK } = await import('@web3auth/modal');

  // Fetch publishable client ID from edge function
  const { data: cfg, error: cfgErr } = await supabase.functions.invoke(
    'web3auth-exchange',
    { body: { action: 'config' } },
  );
  if (cfgErr || !cfg?.clientId) {
    throw new Error('Failed to load Web3Auth config');
  }

  const options: any = {
    clientId: cfg.clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    chainConfig: {
      chainNamespace: 'eip155',
      chainId: '0x1',
      rpcTarget: 'https://rpc.ankr.com/eth',
      displayName: 'Ethereum Mainnet',
      blockExplorerUrl: 'https://etherscan.io',
      ticker: 'ETH',
      tickerName: 'Ethereum',
    },
    uiConfig: {
      mode: 'dark',
      loginMethodsOrder: ['google', 'apple', 'email_passwordless'],
    },
  };

  const instance = new Web3Auth(options);
  await instance.init();
  web3authInstance = instance;
  return instance;
}

async function getWeb3Auth() {
  if (web3authInstance?.status === 'ready' || web3authInstance?.status === 'connected') {
    return web3authInstance;
  }
  if (!initPromise) initPromise = loadAndInit();
  return initPromise;
}

/* ------------------------------------------------------------------ */
/*  Provider mapping for v10 API                                      */
/* ------------------------------------------------------------------ */

const AUTH_CONNECTION_MAP: Record<string, string> = {
  google: 'google',
  apple: 'apple',
  email_passwordless: 'email_passwordless',
};

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export type Web3AuthProvider = 'google' | 'apple' | 'email_passwordless';

/**
 * Connects via Web3Auth for the chosen provider.
 * Returns the authenticated user's info (email, name, idToken).
 */
export async function loginWithProvider(
  provider: Web3AuthProvider,
  emailHint?: string,
) {
  const web3auth = await getWeb3Auth();

  // Disconnect if already connected from a previous session
  if (web3auth.status === 'connected') {
    try { await web3auth.logout(); } catch { /* ignore */ }
  }

  // v10 API: use WALLET_CONNECTORS.AUTH + authConnection
  const connectParams: Record<string, any> = {
    authConnection: AUTH_CONNECTION_MAP[provider],
  };
  if (provider === 'email_passwordless' && emailHint) {
    connectParams.authConnectionParams = { login_hint: emailHint };
  }

  // In v10, the connector name is 'auth' (string constant)
  await web3auth.connectTo('auth', connectParams);

  const userInfo = await web3auth.getUserInfo();
  if (!userInfo?.email) {
    throw new Error('Web3Auth did not return an email address');
  }

  return userInfo as {
    email: string;
    name?: string;
    idToken?: string;
    profileImage?: string;
    typeOfLogin?: string;
  };
}

/**
 * Exchanges the Web3Auth identity for a Supabase session.
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

/**
 * Disconnects Web3Auth (call alongside supabase.auth.signOut).
 */
export async function web3authLogout() {
  try {
    if (web3authInstance?.status === 'connected') {
      await web3authInstance.logout();
    }
  } catch {
    // Best-effort
  }
}
