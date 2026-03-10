import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface WalletModalContextType {
  isOpen: boolean;
  openWallet: () => void;
  closeWallet: () => void;
}

const WalletModalContext = createContext<WalletModalContextType>({
  isOpen: false,
  openWallet: () => {},
  closeWallet: () => {},
});

export const useWalletModal = () => useContext(WalletModalContext);

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openWallet = useCallback(() => setIsOpen(true), []);
  const closeWallet = useCallback(() => setIsOpen(false), []);

  return (
    <WalletModalContext.Provider value={{ isOpen, openWallet, closeWallet }}>
      {children}
    </WalletModalContext.Provider>
  );
}
