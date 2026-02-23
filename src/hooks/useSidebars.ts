import { ReactNode, useEffect, useRef } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 *
 * Uses a serializable key derived from whether the sidebar is null/undefined/JSX
 * to re-run the effect only when the "shape" changes, avoiding infinite loops
 * from inline JSX references.
 */
export function useSidebars(left?: ReactNode | null, right?: ReactNode | null) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();
  const leftRef = useRef(left);
  const rightRef = useRef(right);

  leftRef.current = left;
  rightRef.current = right;

  // Derive a stable key: 'null' | 'undefined' | 'element'
  const leftKey = left === null ? 'null' : left === undefined ? 'undefined' : 'element';
  const rightKey = right === null ? 'null' : right === undefined ? 'undefined' : 'element';

  useEffect(() => {
    setLeftSidebar(leftRef.current);
    setRightSidebar(rightRef.current);

    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
  // Re-run when the kind of sidebar changes (null→element, etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftKey, rightKey, setLeftSidebar, setRightSidebar]);
}
