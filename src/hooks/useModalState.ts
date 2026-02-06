/**
 * Unified Modal/Drawer State Management Hook
 * 
 * Provides a centralized way to manage multiple modal/drawer states
 * instead of having separate boolean states for each.
 */

import { useState, useCallback, useMemo } from 'react';

export type ModalId = 
  | 'settings'
  | 'profile'
  | 'hypnosis'
  | 'leftSheet'
  | 'notifications'
  | 'bugReport'
  | 'achievements'
  | 'quest'
  | 'leaderboard'
  | 'share'
  | 'confirm'
  | 'edit'
  | 'delete'
  | string; // Allow custom modal IDs

interface UseModalStateReturn {
  /** Open a modal by ID */
  open: (id: ModalId) => void;
  /** Close a modal by ID */
  close: (id: ModalId) => void;
  /** Toggle a modal by ID */
  toggle: (id: ModalId) => void;
  /** Check if a modal is open */
  isOpen: (id: ModalId) => boolean;
  /** Close all modals */
  closeAll: () => void;
  /** Get all currently open modal IDs */
  openModals: ModalId[];
}

/**
 * Hook for managing multiple modal states in a unified way
 * 
 * @example
 * ```tsx
 * const modals = useModalState();
 * 
 * // Open a modal
 * modals.open('settings');
 * 
 * // Check if open
 * if (modals.isOpen('settings')) { ... }
 * 
 * // Close
 * modals.close('settings');
 * 
 * // In JSX
 * <Dialog open={modals.isOpen('settings')} onOpenChange={() => modals.toggle('settings')}>
 * ```
 */
export function useModalState(): UseModalStateReturn {
  const [modals, setModals] = useState<Record<ModalId, boolean>>({});

  const open = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: true }));
  }, []);

  const close = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: false }));
  }, []);

  const toggle = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isOpen = useCallback((id: ModalId) => {
    return modals[id] ?? false;
  }, [modals]);

  const closeAll = useCallback(() => {
    setModals({});
  }, []);

  const openModals = useMemo(() => {
    return Object.entries(modals)
      .filter(([, isOpen]) => isOpen)
      .map(([id]) => id as ModalId);
  }, [modals]);

  return {
    open,
    close,
    toggle,
    isOpen,
    closeAll,
    openModals,
  };
}

/**
 * Hook for a single modal (simpler API when you only need one)
 */
export function useSingleModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}
