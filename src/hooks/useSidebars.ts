import { ReactNode, useEffect, useRef, useMemo } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';

/**
 * Hook for hub pages to set their custom sidebars into the root layout.
 * Pass `null` to explicitly hide a sidebar, or `undefined`/omit to use defaults.
 *
 * An optional `deps` array can be passed to trigger sidebar re-registration
 * when specific values change (e.g., selected item IDs).
 */
export function useSidebars(
  left?: ReactNode | null,
  right?: ReactNode | null,
  deps?: unknown[]
) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();

  // Memoize a version key from deps to avoid re-running when deps haven't changed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depsKey = useMemo(() => ({}), deps ?? []);

  // Set sidebars when depsKey changes (mount + deps changes)
  useEffect(() => {
    setLeftSidebar(left);
    setRightSidebar(right);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, setLeftSidebar, setRightSidebar]);

  // Clear on unmount
  useEffect(() => {
    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
