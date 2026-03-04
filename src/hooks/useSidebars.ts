import { ReactNode, useEffect, useRef } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 *
 * Uses a ref + queueMicrotask pattern to batch sidebar updates and avoid
 * infinite re-render loops caused by setting context state during effects.
 */
export function useSidebars(left?: ReactNode | null, right?: ReactNode | null) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();
  const leftRef = useRef<ReactNode | null | undefined>(left);
  const rightRef = useRef<ReactNode | null | undefined>(right);
  const mountedRef = useRef(false);

  // Always keep refs in sync with latest JSX
  leftRef.current = left;
  rightRef.current = right;

  // Set sidebars on mount
  useEffect(() => {
    mountedRef.current = true;
    setLeftSidebar(leftRef.current);
    setRightSidebar(rightRef.current);

    return () => {
      mountedRef.current = false;
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update sidebars when content changes — use a microtask to avoid
  // synchronous setState-during-render. Only run after mount.
  useEffect(() => {
    if (!mountedRef.current) return;
    // Deferred update to break the render cycle
    const id = requestAnimationFrame(() => {
      if (mountedRef.current) {
        setLeftSidebar(leftRef.current);
        setRightSidebar(rightRef.current);
      }
    });
    return () => cancelAnimationFrame(id);
  });
}
