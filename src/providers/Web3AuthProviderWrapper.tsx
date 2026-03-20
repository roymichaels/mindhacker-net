/**
 * Thin wrapper that renders Web3AuthProvider with static config.
 * Includes error boundary so Web3Auth SDK failures don't blank the app.
 */
import { Component, type ReactNode, createContext, useContext, useEffect, type ErrorInfo } from 'react';
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

/** Internal error boundary that catches Web3Auth SDK crashes */
class Web3AuthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Web3Auth] Provider crashed — rendering without Web3Auth:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Render children without Web3Auth so the app still works
      return (
        <Web3AuthReadyContext.Provider value={false}>
          {this.props.children}
        </Web3AuthReadyContext.Provider>
      );
    }
    return this.props.children;
  }
}

export default function Web3AuthProviderWrapper({ children }: Props) {
  // Force dir="ltr" on Web3Auth modal elements so RTL pages don't break them
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLElement) {
            // Web3Auth modal root or its container
            if (
              node.id?.startsWith('w3a') ||
              node.className?.includes?.('w3a-modal') ||
              node.querySelector?.('#w3a-modal, [class*="w3a-modal"]')
            ) {
              node.dir = 'ltr';
              node.style.direction = 'ltr';
              node.style.textAlign = 'left';
              // Also set on inner children
              const inner = node.querySelectorAll('[class*="w3a-"]');
              inner.forEach((el) => {
                (el as HTMLElement).dir = 'ltr';
              });
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <Web3AuthErrorBoundary>
      <Web3AuthProvider config={contextConfig}>
        <Web3AuthReadyContext.Provider value={true}>
          {children}
        </Web3AuthReadyContext.Provider>
      </Web3AuthProvider>
    </Web3AuthErrorBoundary>
  );
}
