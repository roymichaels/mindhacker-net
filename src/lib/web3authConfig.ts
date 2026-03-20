/**
 * Web3Auth v10 Plug and Play modal configuration.
 *
 * Notes:
 * - Client ID is a publishable key, safe for frontend usage.
 * - Defaults to SAPPHIRE_DEVNET for the fallback client ID.
 * - Includes AA chain config required by dashboard Smart Account settings.
 */
import {
  CHAIN_NAMESPACES,
  type LoginMethodConfig,
  WALLET_CONNECTORS,
  WEB3AUTH_NETWORK,
  type Web3AuthOptions,
} from '@web3auth/modal';

const FALLBACK_CLIENT_ID =
  'BDUeePBUxdKKnluY6zAzDRsrDwOz1YQNKm1l-jKStb5SP5qGKlYRYrNspoXH3eGnTJJJUo9dGPkOht7cu1Kil18';

const CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || FALLBACK_CLIENT_ID;

const defaultNetworkForClient =
  CLIENT_ID === FALLBACK_CLIENT_ID ? 'SAPPHIRE_DEVNET' : 'SAPPHIRE_MAINNET';
const NETWORK_KEY = (
  import.meta.env.VITE_WEB3AUTH_NETWORK || defaultNetworkForClient
).toUpperCase();
const WEB3AUTH_NETWORK_VALUE =
  WEB3AUTH_NETWORK[NETWORK_KEY as keyof typeof WEB3AUTH_NETWORK] ??
  WEB3AUTH_NETWORK.SAPPHIRE_MAINNET;

const MAINNET_CHAIN = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x1',
  rpcTarget: 'https://rpc.ankr.com/eth',
  displayName: 'Ethereum Mainnet',
  blockExplorerUrl: 'https://etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

const withConnectionId = (
  config: NonNullable<LoginMethodConfig[keyof LoginMethodConfig]>,
  authConnectionId?: string
) => (authConnectionId ? { ...config, authConnectionId } : config);

const loginMethods: LoginMethodConfig = {
  google: withConnectionId(
    { name: 'Google', showOnModal: true, mainOption: true },
    import.meta.env.VITE_WEB3AUTH_GOOGLE_AUTH_CONNECTION_ID
  ),
  apple: withConnectionId(
    { name: 'Apple', showOnModal: true, mainOption: true },
    import.meta.env.VITE_WEB3AUTH_APPLE_AUTH_CONNECTION_ID
  ),
  discord: withConnectionId(
    { name: 'Discord', showOnModal: true },
    import.meta.env.VITE_WEB3AUTH_DISCORD_AUTH_CONNECTION_ID
  ),
  twitter: withConnectionId(
    { name: 'Twitter', showOnModal: true },
    import.meta.env.VITE_WEB3AUTH_TWITTER_AUTH_CONNECTION_ID
  ),
  email_passwordless: withConnectionId(
    { name: 'Email', showOnModal: true, mainOption: true },
    import.meta.env.VITE_WEB3AUTH_EMAIL_AUTH_CONNECTION_ID
  ),
  sms_passwordless: withConnectionId(
    { name: 'SMS', showOnModal: true },
    import.meta.env.VITE_WEB3AUTH_SMS_AUTH_CONNECTION_ID
  ),
  facebook: { name: 'Facebook', showOnModal: false },
  reddit: { name: 'Reddit', showOnModal: false },
  twitch: { name: 'Twitch', showOnModal: false },
  github: { name: 'GitHub', showOnModal: false },
  linkedin: { name: 'LinkedIn', showOnModal: false },
  farcaster: { name: 'Farcaster', showOnModal: false },
};

if (!import.meta.env.VITE_WEB3AUTH_CLIENT_ID) {
  console.warn(
    '[Web3Auth] VITE_WEB3AUTH_CLIENT_ID is not set; using fallback client id.'
  );
}

export const web3AuthOptions: Web3AuthOptions = {
  clientId: CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK_VALUE,
  enableLogging: import.meta.env.DEV,
  chains: [MAINNET_CHAIN],
  // Required: dashboard has Smart Accounts enabled — SDK refuses to init without this
  accountAbstractionConfig: {
    chains: [
      {
        chainId: MAINNET_CHAIN.chainId,
        bundlerConfig: {
          url: import.meta.env.VITE_WEB3AUTH_BUNDLER_URL || 'https://public.pimlico.io/v2/1/rpc',
        },
      },
    ],
  },
  useAAWithExternalWallet: false,
  modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        label: 'auth',
        showOnModal: true,
        loginMethods,
      },
      [WALLET_CONNECTORS.WALLET_CONNECT_V2]: {
        label: 'wallet_connect',
        showOnModal: true,
      },
      [WALLET_CONNECTORS.METAMASK]: {
        label: 'metamask',
        showOnModal: true,
      },
    },
  },
};
