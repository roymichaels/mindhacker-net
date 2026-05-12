/**
 * OverlayController — single source of truth for the mobile shell overlays.
 *
 * Enforces the "one overlay at a time" rule from the shell architecture spec:
 * opening any overlay (drawer, env sheet, AION sheet, profile/settings sheet,
 * hub sheet) automatically closes any other overlay that is currently open.
 *
 * This is a pure controller — it does not render anything. Components consume
 * `useOverlay()` to read the active overlay and to call `open(kind, payload)` /
 * `close()`. Visual primitives (LeftDrawer, BottomSheet) wire their
 * `open`/`onOpenChange` props to this controller.
 */
import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

export type OverlayKind =
  | 'drawer'
  | 'env'
  | 'aion'
  | 'settings'
  | 'profile'
  | `hub:${string}`;

export interface OverlayState {
  kind: OverlayKind | null;
  payload?: unknown;
}

interface OverlayContextValue {
  active: OverlayState;
  isOpen: (kind: OverlayKind) => boolean;
  open: (kind: OverlayKind, payload?: unknown) => void;
  close: () => void;
  toggle: (kind: OverlayKind, payload?: unknown) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<OverlayState>({ kind: null });

  const open = useCallback((kind: OverlayKind, payload?: unknown) => {
    setActive({ kind, payload });
  }, []);

  const close = useCallback(() => {
    setActive({ kind: null });
  }, []);

  const toggle = useCallback((kind: OverlayKind, payload?: unknown) => {
    setActive((prev) => (prev.kind === kind ? { kind: null } : { kind, payload }));
  }, []);

  const isOpen = useCallback((kind: OverlayKind) => active.kind === kind, [active.kind]);

  const value = useMemo<OverlayContextValue>(
    () => ({ active, isOpen, open, close, toggle }),
    [active, isOpen, open, close, toggle],
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    // Safe no-op fallback so consumers outside the provider don't crash.
    return {
      active: { kind: null },
      isOpen: () => false,
      open: () => {},
      close: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/** Convenience hook: bind a specific overlay kind to a controlled open/onOpenChange pair. */
export function useOverlayBinding(kind: OverlayKind) {
  const { isOpen, open, close } = useOverlay();
  return {
    open: isOpen(kind),
    onOpenChange: (next: boolean) => (next ? open(kind) : close()),
  };
}