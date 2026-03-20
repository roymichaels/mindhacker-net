/**
 * Web3Auth v10 configuration.
 *
 * The client ID is fetched from the backend (edge function) at boot time
 * because it lives as a secret. It is a publishable key — safe for frontend.
 */
import { type Web3AuthOptions, WEB3AUTH_NETWORK } from '@web3auth/modal';
import { supabase } from '@/integrations/supabase/client';

let cachedClientId: string | null = null;

/** Fetch the Web3Auth publishable client ID from the edge function. */
export async function getWeb3AuthClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId;

  const { data, error } = await supabase.functions.invoke('web3auth-exchange', {
    body: { action: 'config' },
  });

  if (error || !data?.clientId) {
    throw new Error('Failed to load Web3Auth client ID from backend');
  }

  cachedClientId = data.clientId;
  return data.clientId;
}

/** Build the Web3AuthOptions for the provider. */
export function buildWeb3AuthOptions(clientId: string): Web3AuthOptions {
  return {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    // v10 uses `chains` array instead of `chainConfig`
    chains: [
      {
        chainNamespace: 'eip155' as any,
        chainId: '0x1',
        rpcTarget: 'https://rpc.ankr.com/eth',
        displayName: 'Ethereum Mainnet',
        blockExplorerUrl: 'https://etherscan.io',
        ticker: 'ETH',
        tickerName: 'Ethereum',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      },
    ],
  };
}
