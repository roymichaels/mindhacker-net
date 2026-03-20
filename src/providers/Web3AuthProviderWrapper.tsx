/**
 * Thin wrapper that renders Web3AuthProvider with static config.
 * No async fetch needed — Client ID is a publishable key embedded in config.
 */
import { type ReactNode, createContext, useContext } from 'react';
import {
  Web3AuthProvider,
  type Web3AuthContextConfig,
} from '@web3auth/modal/react';
import { web3AuthOptions } from '@/lib/web3authConfig';

interface Props {
  children: ReactNode;
}

/** Context to track whether Web3Auth provider is mounted */
const Web3AuthReadyContext = createContext(true);
export const useWeb3AuthReady = () => useContext(Web3AuthReadyContext);

const contextConfig: Web3AuthContextConfig = { web3AuthOptions };

export default function Web3AuthProviderWrapper({ children }: Props) {
  return (
    <Web3AuthProvider config={contextConfig}>
      <Web3AuthReadyContext.Provider value={true}>
        {children}
      </Web3AuthReadyContext.Provider>
    </Web3AuthProvider>
  );
}
