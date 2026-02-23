import { ReactNode, useEffect, useRef } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 */
export function useSidebars(left?: ReactNode | null, right?: ReactNode | null) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();
  const leftRef = useRef(left);
  const rightRef = useRef(right);
  leftRef.current = left;
  rightRef.current = right;

  useEffect(() => {
    setLeftSidebar(leftRef.current);
    setRightSidebar(rightRef.current);

    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLeftSidebar, setRightSidebar]);

  // Update on re-renders
  useEffect(() => {
    setLeftSidebar(left);
    setRightSidebar(right);
  });
}
