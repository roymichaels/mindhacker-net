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
  // Force dir="ltr" on Web3Auth modal elements so RTL pages don't break them,
  // and inject a dark backdrop when the modal is visible.
  useEffect(() => {
    let backdrop: HTMLDivElement | null = null;

    const ensureBackdrop = () => {
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'w3a-backdrop';
        Object.assign(backdrop.style, {
          position: 'fixed',
          inset: '0',
          zIndex: '99',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          transition: 'opacity 200ms ease',
          opacity: '0',
          pointerEvents: 'none',
        });
        document.body.appendChild(backdrop);
      }
    };

    const showBackdrop = () => {
      ensureBackdrop();
      if (backdrop) {
        backdrop.style.opacity = '1';
        backdrop.style.pointerEvents = 'auto';
      }
    };

    const hideBackdrop = () => {
      if (backdrop) {
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
      }
    };

    const observer = new MutationObserver(() => {
      const modalEl =
        document.getElementById('w3a-modal') ||
        document.querySelector('[class*="w3a-modal"]');

      if (modalEl) {
        const isVisible =
          window.getComputedStyle(modalEl).display !== 'none' &&
          window.getComputedStyle(modalEl).visibility !== 'hidden';

        if (isVisible) {
          // Fix RTL
          (modalEl as HTMLElement).dir = 'ltr';
          (modalEl as HTMLElement).style.direction = 'ltr';
          (modalEl as HTMLElement).style.textAlign = 'left';
          const inner = modalEl.querySelectorAll('[class*="w3a-"]');
          inner.forEach((el) => {
            (el as HTMLElement).dir = 'ltr';
          });
          // Ensure modal is above backdrop
          (modalEl as HTMLElement).style.zIndex = '100';
          const parent = modalEl.closest('[id^="w3a"]') || modalEl.parentElement;
          if (parent && parent !== modalEl) {
            (parent as HTMLElement).style.zIndex = '100';
          }
          showBackdrop();
        } else {
          hideBackdrop();
        }
      } else {
        hideBackdrop();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      observer.disconnect();
      if (backdrop) {
        backdrop.remove();
        backdrop = null;
      }
    };
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
