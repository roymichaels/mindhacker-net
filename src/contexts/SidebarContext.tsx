import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

interface SidebarContextType {
  leftSidebar: ReactNode | null | undefined;
  rightSidebar: ReactNode | null | undefined;
  setLeftSidebar: (node: ReactNode | null | undefined) => void;
  setRightSidebar: (node: ReactNode | null | undefined) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  leftSidebar: undefined,
  rightSidebar: undefined,
  setLeftSidebar: () => {},
  setRightSidebar: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [version, setVersion] = useState(0);
  const leftRef = useRef<ReactNode | null | undefined>(undefined);
  const rightRef = useRef<ReactNode | null | undefined>(undefined);

  const setLeftSidebar = useCallback((node: ReactNode | null | undefined) => {
    leftRef.current = node;
    setVersion(v => v + 1);
  }, []);

  const setRightSidebar = useCallback((node: ReactNode | null | undefined) => {
    rightRef.current = node;
    setVersion(v => v + 1);
  }, []);

  // Use version to ensure consumers re-render when sidebars change
  // but avoid infinite loops since refs don't cause re-renders in the setter's caller
  void version;

  return (
    <SidebarContext.Provider value={{ 
      leftSidebar: leftRef.current, 
      rightSidebar: rightRef.current, 
      setLeftSidebar, 
      setRightSidebar 
    }}>
      {children}
    </SidebarContext.Provider>
  );
};
