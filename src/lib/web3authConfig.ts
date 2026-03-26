/**
 * Web3Auth v10 Plug and Play modal configuration.
 *
 * Notes:
 * - Client ID is a publishable key, safe for frontend usage.
 * - Defaults to a network that matches the configured client ID.
 * - Keep startup auth-only. Do not initialize smart-account / AA features here.
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

// Default to the dev-safe fallback client unless production client usage is
// explicitly opted in. This avoids wallet-service / smart-account gating on
// environments that only need social auth right now.
const USE_PROD_CLIENT = import.meta.env.VITE_WEB3AUTH_USE_PROD_CLIENT === 'true';
const CLIENT_ID =
  USE_PROD_CLIENT && import.meta.env.VITE_WEB3AUTH_CLIENT_ID
    ? import.meta.env.VITE_WEB3AUTH_CLIENT_ID
    : FALLBACK_CLIENT_ID;
const IS_FALLBACK_CLIENT_ID = CLIENT_ID === FALLBACK_CLIENT_ID;
const DEFAULT_NETWORK_KEY = IS_FALLBACK_CLIENT_ID
  ? 'SAPPHIRE_DEVNET'
  : 'SAPPHIRE_MAINNET';
const NETWORK_KEY = (
  IS_FALLBACK_CLIENT_ID
    ? DEFAULT_NETWORK_KEY
    : import.meta.env.VITE_WEB3AUTH_NETWORK || DEFAULT_NETWORK_KEY
).toUpperCase();
const WEB3AUTH_NETWORK_VALUE =
  WEB3AUTH_NETWORK[NETWORK_KEY as keyof typeof WEB3AUTH_NETWORK] ??
  WEB3AUTH_NETWORK[DEFAULT_NETWORK_KEY as keyof typeof WEB3AUTH_NETWORK];
const ENABLE_EXTERNAL_WALLETS =
  import.meta.env.VITE_ENABLE_EXTERNAL_WALLETS === 'true';

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

const HOLESKY_CHAIN = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x4268',
  rpcTarget: 'https://ethereum-holesky-rpc.publicnode.com',
  displayName: 'Ethereum Holesky',
  blockExplorerUrl: 'https://holesky.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

const DEFAULT_CHAIN = IS_FALLBACK_CLIENT_ID ? HOLESKY_CHAIN : MAINNET_CHAIN;
const CHAINS = [DEFAULT_CHAIN, MAINNET_CHAIN, HOLESKY_CHAIN].filter(
  (chain, index, chains) =>
    chains.findIndex((candidate) => candidate.chainId === chain.chainId) === index
);
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

if (!USE_PROD_CLIENT) {
  console.info(
    '[Web3Auth] Using fallback dev client for auth-only login. Set VITE_WEB3AUTH_USE_PROD_CLIENT=true to use the configured production client.'
  );
}

if (import.meta.env.DEV && !import.meta.env.VITE_WEB3AUTH_CLIENT_ID) {
  console.info(
    '[Web3Auth] VITE_WEB3AUTH_CLIENT_ID is not set; using fallback devnet client id.'
  );
}

if (import.meta.env.DEV && !import.meta.env.VITE_WEB3AUTH_NETWORK) {
  console.info(
    `[Web3Auth] VITE_WEB3AUTH_NETWORK is not set; defaulting to ${DEFAULT_NETWORK_KEY}.`
  );
}

export const web3AuthOptions: Web3AuthOptions = {
  clientId: CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK_VALUE,
  enableLogging: false,
  defaultChainId: DEFAULT_CHAIN.chainId,
  chains: CHAINS,
  modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        label: 'auth',
        showOnModal: true,
        loginMethods,
      },
      ...(ENABLE_EXTERNAL_WALLETS
        ? {
            [WALLET_CONNECTORS.WALLET_CONNECT_V2]: {
              label: 'wallet_connect',
              showOnModal: true,
            },
            [WALLET_CONNECTORS.METAMASK]: {
              label: 'metamask',
              showOnModal: true,
            },
          }
        : {}),
    },
  },
};
