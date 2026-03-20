/**
 * Wrapper that fetches the Web3Auth client ID at boot, then renders
 * the official Web3AuthProvider from @web3auth/modal/react.
 *
 * This component must wrap the entire app ABOVE AuthProvider so that
 * Web3Auth hooks are available everywhere.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Web3AuthProvider, type Web3AuthContextConfig } from '@web3auth/modal/react';
import { getWeb3AuthClientId, buildWeb3AuthOptions } from '@/lib/web3authConfig';

interface Props {
  children: ReactNode;
}

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

  // While loading config, render children without Web3Auth context.
  // Auth modal will show a loading state if hooks aren't ready yet.
  if (error) {
    console.warn('[Web3Auth] Running without Web3Auth due to init error:', error);
    return <>{children}</>;
  }

  if (!config) {
    // Render children immediately — the auth modal handles the loading state
    return <>{children}</>;
  }

  return (
    <Web3AuthProvider config={config}>
      {children}
    </Web3AuthProvider>
  );
}
