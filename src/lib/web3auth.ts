/**
 * Web3Auth Core Kit (no-modal) integration.
 * Lazy-loads the SDK to keep the main bundle small.
 * After Web3Auth authenticates, bridges to Supabase via the
 * web3auth-exchange edge function so all RLS/data access stays intact.
 */
import { supabase } from '@/integrations/supabase/client';

// Singleton — initialised once, reused across calls
let web3authInstance: any = null;
let initPromise: Promise<any> | null = null;

/* ------------------------------------------------------------------ */
/*  Lazy SDK loader + init                                            */
/* ------------------------------------------------------------------ */

async function loadAndInit() {
  // Dynamic imports — Web3Auth SDK only downloaded when user tries to log in
  const [
    { Web3AuthNoModal },
    { CHAIN_NAMESPACES, WEB3AUTH_NETWORK },
    { AuthAdapter },
    { EthereumPrivateKeyProvider },
  ] = await Promise.all([
    import('@web3auth/no-modal'),
    import('@web3auth/base'),
    import('@web3auth/auth-adapter'),
    import('@web3auth/ethereum-provider'),
  ]);

  // Fetch publishable client ID from edge function (stored as secret)
  const { data: cfg, error: cfgErr } = await supabase.functions.invoke(
    'web3auth-exchange',
    { body: { action: 'config' } },
  );
  if (cfgErr || !cfg?.clientId) {
    throw new Error('Failed to load Web3Auth config');
  }

  // Minimal chain config — required by SDK, not used for transactions yet
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x1',
    rpcTarget: 'https://rpc.ankr.com/eth',
    displayName: 'Ethereum Mainnet',
    blockExplorerUrl: 'https://etherscan.io',
    ticker: 'ETH',
    tickerName: 'Ethereum',
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const instance = new Web3AuthNoModal({
    clientId: cfg.clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider,
  });

  const authAdapter = new AuthAdapter({
    adapterSettings: { uxMode: 'popup' },
  });
  instance.configureAdapter(authAdapter);

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
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export type Web3AuthProvider = 'google' | 'apple' | 'email_passwordless';

/**
 * Opens Web3Auth popup for the chosen provider.
 * Returns the authenticated user's info (email, name, idToken).
 */
export async function loginWithProvider(
  provider: Web3AuthProvider,
  emailHint?: string,
) {
  const web3auth = await getWeb3Auth();

  // If already connected from a previous session, disconnect first
  if (web3auth.status === 'connected') {
    await web3auth.logout();
  }

  const { WALLET_ADAPTERS } = await import('@web3auth/base');

  const loginParams: Record<string, any> = { loginProvider: provider };
  if (provider === 'email_passwordless' && emailHint) {
    loginParams.extraLoginOptions = { login_hint: emailHint };
  }

  await web3auth.connectTo(WALLET_ADAPTERS.AUTH, loginParams);

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
 * Calls our edge function which verifies the Web3Auth JWT,
 * creates/finds the Supabase user, and returns a one-time code
 * that the client verifies to establish a full session.
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

  // Verify the OTP to create a proper Supabase session
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
    // Best-effort — Supabase session is already cleared
  }
}
