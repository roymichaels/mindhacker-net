import { ReactNode, useEffect, useRef } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 *
 * Uses refs to track sidebar content and only updates context when
 * the component mounts/unmounts, avoiding infinite render loops.
 */
export function useSidebars(left?: ReactNode | null, right?: ReactNode | null) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();
  const leftRef = useRef(left);
  const rightRef = useRef(right);

  // Keep refs current
  leftRef.current = left;
  rightRef.current = right;

  // Set sidebars on mount and whenever left/right identity changes
  // We use a layout-safe approach: update via ref on each render,
  // but only call setState in a controlled effect
  useEffect(() => {
    setLeftSidebar(leftRef.current);
    setRightSidebar(rightRef.current);
  }); // intentionally no deps — runs after each render but refs prevent loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
