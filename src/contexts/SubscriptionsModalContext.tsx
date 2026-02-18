import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SubscriptionsModalContextValue {
  isOpen: boolean;
  openSubscriptions: () => void;
  closeSubscriptions: () => void;
}

const SubscriptionsModalContext = createContext<SubscriptionsModalContextValue>({
  isOpen: false,
  openSubscriptions: () => {},
  closeSubscriptions: () => {},
});

export const useSubscriptionsModal = () => useContext(SubscriptionsModalContext);

export const SubscriptionsModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openSubscriptions = useCallback(() => setIsOpen(true), []);
  const closeSubscriptions = useCallback(() => setIsOpen(false), []);

  return (
    <SubscriptionsModalContext.Provider value={{ isOpen, openSubscriptions, closeSubscriptions }}>
      {children}
    </SubscriptionsModalContext.Provider>
  );
};
