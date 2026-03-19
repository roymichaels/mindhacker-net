import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ProfileModalContextValue {
  isOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

const ProfileModalContext = createContext<ProfileModalContextValue | null>(null);

export function ProfileModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openProfile = useCallback(() => setIsOpen(true), []);
  const closeProfile = useCallback(() => setIsOpen(false), []);

  return (
    <ProfileModalContext.Provider value={{ isOpen, openProfile, closeProfile }}>
      {children}
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal() {
  const ctx = useContext(ProfileModalContext);
  if (!ctx) throw new Error('useProfileModal must be used within ProfileModalProvider');
  return ctx;
}
