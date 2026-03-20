/**
 * Web3Auth v10 configuration — static, synchronous.
 *
 * The Client ID is a publishable key (like Stripe's pk_), safe for frontend.
 * Network must match the dashboard environment (Devnet vs Mainnet).
 */
import {
  WALLET_CONNECTORS,
  WEB3AUTH_NETWORK,
  type Web3AuthOptions,
} from '@web3auth/modal';

const CLIENT_ID =
  'BDUeePBUxdKKnluY6zAzDRsrDwOz1YQNKm1l-jKStb5SP5qGKlYRYrNspoXH3eGnTJJJUo9dGPkOht7cu1Kil18';

export const web3AuthOptions: Web3AuthOptions = {
  clientId: CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        label: 'auth',
        showOnModal: true,
        loginMethods: {
          google: { name: 'Google', showOnModal: true },
          apple: { name: 'Apple', showOnModal: true },
          discord: { name: 'Discord', showOnModal: true },
          twitter: { name: 'Twitter', showOnModal: true },
          email_passwordless: { name: 'Email', showOnModal: true },
          sms_passwordless: { name: 'SMS', showOnModal: true },
          // Hide methods we don't want in the modal
          facebook: { name: 'Facebook', showOnModal: false },
          reddit: { name: 'Reddit', showOnModal: false },
          twitch: { name: 'Twitch', showOnModal: false },
          github: { name: 'GitHub', showOnModal: false },
          linkedin: { name: 'LinkedIn', showOnModal: false },
          weibo: { name: 'Weibo', showOnModal: false },
          wechat: { name: 'WeChat', showOnModal: false },
          line: { name: 'Line', showOnModal: false },
          kakao: { name: 'Kakao', showOnModal: false },
          farcaster: { name: 'Farcaster', showOnModal: false },
        },
      },
      [WALLET_CONNECTORS.WALLET_CONNECT]: {
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
