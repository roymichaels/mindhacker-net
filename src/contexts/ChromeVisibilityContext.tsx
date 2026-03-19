/**
 * ChromeVisibilityContext — lets any child component hide the global header/bottom bar.
 * Used by career wizards, full-screen modals, etc.
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChromeVisibilityContextType {
  headerHidden: boolean;
  hideHeader: () => void;
  showHeader: () => void;
}

const ChromeVisibilityContext = createContext<ChromeVisibilityContextType>({
  headerHidden: false,
  hideHeader: () => {},
  showHeader: () => {},
});

export function ChromeVisibilityProvider({ children }: { children: ReactNode }) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const hideHeader = useCallback(() => setHeaderHidden(true), []);
  const showHeader = useCallback(() => setHeaderHidden(false), []);

  return (
    <ChromeVisibilityContext.Provider value={{ headerHidden, hideHeader, showHeader }}>
      {children}
    </ChromeVisibilityContext.Provider>
  );
}

export const useChromeVisibility = () => useContext(ChromeVisibilityContext);
