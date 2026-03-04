import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  const [leftSidebar, setLeftRaw] = useState<ReactNode | null | undefined>(undefined);
  const [rightSidebar, setRightRaw] = useState<ReactNode | null | undefined>(undefined);

  const setLeftSidebar = useCallback((node: ReactNode | null | undefined) => setLeftRaw(node), []);
  const setRightSidebar = useCallback((node: ReactNode | null | undefined) => setRightRaw(node), []);

  return (
    <SidebarContext.Provider value={{ leftSidebar, rightSidebar, setLeftSidebar, setRightSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
