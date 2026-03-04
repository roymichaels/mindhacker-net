import { ReactNode, useEffect, useRef } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 *
 * Sidebar content is set on every commit via a ref-guarded effect that
 * only triggers context updates when the content actually changes
 * (prevents infinite render loops).
 */
export function useSidebars(left?: ReactNode | null, right?: ReactNode | null) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();
  const leftRef = useRef(left);
  const rightRef = useRef(right);
  const initializedRef = useRef(false);

  // On every render, update refs silently
  leftRef.current = left;
  rightRef.current = right;

  // Set on mount, clear on unmount
  useEffect(() => {
    initializedRef.current = true;
    setLeftSidebar(leftRef.current);
    setRightSidebar(rightRef.current);

    return () => {
      initializedRef.current = false;
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLeftSidebar, setRightSidebar]);
}
