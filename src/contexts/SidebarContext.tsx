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
  const [leftSidebar, setLeftSidebar] = useState<ReactNode | null | undefined>(undefined);
  const [rightSidebar, setRightSidebar] = useState<ReactNode | null | undefined>(undefined);

  return (
    <SidebarContext.Provider value={{ leftSidebar, rightSidebar, setLeftSidebar, setRightSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
