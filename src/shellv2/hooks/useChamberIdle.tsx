/**
 * useChamberIdle — chamber-wide idle/activity tracker for ShellV2.
 *
 * Single source of truth for:
 *  - whether the ghost nav dock should be visible
 *  - whether the chamber is in idle mood
 *  - the current composer state (idle | focus | streaming)
 *
 * Frontend-only. No backend, no orchestration.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';

type ComposerState = 'idle' | 'focus' | 'streaming';

interface ChamberIdleValue {
  navVisible: boolean;
  isIdle: boolean;
  composerState: ComposerState;
  toggleNav: () => void;
  hideNav: () => void;
  notifyScroll: (deltaY: number) => void;
  notifyActivity: () => void;
}

const Ctx = createContext<ChamberIdleValue | null>(null);

const IDLE_MS = 6000;
const SCROLL_THRESHOLD = 80;

export function ChamberIdleProvider({ children }: { children: ReactNode }) {
  const { isStreaming } = useAuroraChatContext();
  const [navVisible, setNavVisible] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAccum = useRef(0);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const composerState: ComposerState = isStreaming
    ? 'streaming'
    : composerFocused
      ? 'focus'
      : 'idle';

  const resetIdle = useCallback(() => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), IDLE_MS);
  }, []);

  const notifyActivity = useCallback(() => {
    resetIdle();
  }, [resetIdle]);

  const hideNav = useCallback(() => setNavVisible(false), []);
  const toggleNav = useCallback(() => setNavVisible((v) => !v), []);

  const notifyScroll = useCallback(
    (deltaY: number) => {
      resetIdle();
      scrollAccum.current += deltaY;
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        const total = scrollAccum.current;
        scrollAccum.current = 0;
        if (Math.abs(total) < SCROLL_THRESHOLD) return;
        if (total < 0) setNavVisible(true); // scrolled up → reveal
        else setNavVisible(false); // scrolled down → hide
      }, 250);
    },
    [resetIdle],
  );

  // Hard rules: streaming or composer focus always hides nav.
  useEffect(() => {
    if (isStreaming || composerFocused) setNavVisible(false);
  }, [isStreaming, composerFocused]);

  // Reveal nav once user has been idle for IDLE_MS — but only if no streaming.
  useEffect(() => {
    if (isIdle && !isStreaming && !composerFocused) {
      // Stay hidden by default; the reference idle state shows orb only.
      // Consumers may opt in via tap. We keep nav hidden here intentionally.
    }
  }, [isIdle, isStreaming, composerFocused]);

  // Global activity listeners
  useEffect(() => {
    resetIdle();
    const onActivity = () => resetIdle();
    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);
    return () => {
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [resetIdle]);

  // Watch composer focus via DOM (the composer lives elsewhere in the tree).
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-shellv2-layer="composer"]');
    if (!root) return;
    const onFocusIn = () => setComposerFocused(true);
    const onFocusOut = () => setComposerFocused(false);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const value = useMemo<ChamberIdleValue>(
    () => ({
      navVisible: navVisible && !isStreaming && !composerFocused,
      isIdle,
      composerState,
      toggleNav,
      hideNav,
      notifyScroll,
      notifyActivity,
    }),
    [navVisible, isStreaming, composerFocused, isIdle, composerState, toggleNav, hideNav, notifyScroll, notifyActivity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChamberIdle(): ChamberIdleValue {
  const v = useContext(Ctx);
  if (!v) {
    // Safe defaults when used outside ShellV2 (e.g. legacy routes).
    return {
      navVisible: false,
      isIdle: false,
      composerState: 'idle',
      toggleNav: () => {},
      hideNav: () => {},
      notifyScroll: () => {},
      notifyActivity: () => {},
    };
  }
  return v;
}