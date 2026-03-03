import { ReactNode, useEffect } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 *
 * Updates sidebar context on every render to ensure content stays in sync
 * with changing props (e.g. selectedCurriculumId).
 */
export function useSidebars(left?: ReactNode | null, right?: ReactNode | null) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();

  // Push latest content on every render
  useEffect(() => {
    setLeftSidebar(left);
    setRightSidebar(right);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
