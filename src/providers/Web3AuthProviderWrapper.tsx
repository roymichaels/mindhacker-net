/**
 * Wrapper that fetches the Web3Auth client ID at boot, then renders
 * the official Web3AuthProvider from @web3auth/modal/react.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Web3AuthProvider, type Web3AuthContextConfig } from '@web3auth/modal/react';
import { getWeb3AuthClientId, buildWeb3AuthOptions } from '@/lib/web3authConfig';

interface Props {
  children: ReactNode;
}

/** Context to track whether Web3Auth provider is mounted */
import { createContext, useContext } from 'react';
const Web3AuthReadyContext = createContext(false);
export const useWeb3AuthReady = () => useContext(Web3AuthReadyContext);

export default function Web3AuthProviderWrapper({ children }: Props) {
  const [config, setConfig] = useState<Web3AuthContextConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getWeb3AuthClientId()
      .then((clientId) => {
        if (cancelled) return;
        const web3AuthOptions = buildWeb3AuthOptions(clientId);
        setConfig({ web3AuthOptions });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Web3Auth] Failed to initialize:', err);
        setError(err.message);
      });

    return () => { cancelled = true; };
  }, []);

  // If init failed or still loading, render without provider
  if (!config || error) {
    if (error) {
      console.warn('[Web3Auth] Running without Web3Auth:', error);
    }
    return (
      <Web3AuthReadyContext.Provider value={false}>
        {children}
      </Web3AuthReadyContext.Provider>
    );
  }

  return (
    <Web3AuthProvider config={config}>
      <Web3AuthReadyContext.Provider value={true}>
        {children}
      </Web3AuthReadyContext.Provider>
    </Web3AuthProvider>
  );
}
