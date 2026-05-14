/**
 * LegacyMountGuard — runtime kill switch for legacy surfaces.
 *
 * If any banned legacy component tries to mount on a ShellV2-owned route
 * (`/`, `/aurora`, `/brain`, `/outer-world`), the guard logs the attempt
 * and returns null so no legacy DOM ever leaks under ShellV2.
 */
import { useLocation } from 'react-router-dom';
import { useEffect, type ComponentType } from 'react';

const SHELLV2_ROUTES = ['/', '/aurora', '/brain', '/outer-world'];

function isShellV2Route(pathname: string): boolean {
  if (SHELLV2_ROUTES.includes(pathname)) return true;
  return (
    pathname.startsWith('/aurora/') ||
    pathname.startsWith('/brain/') ||
    pathname.startsWith('/outer-world/')
  );
}

export function withLegacyGuard<P extends object>(
  name: string,
  Component: ComponentType<P>,
): ComponentType<P> {
  const Guarded = (props: P) => {
    const { pathname } = useLocation();
    if (isShellV2Route(pathname)) {
      // eslint-disable-next-line no-console
      console.warn(`[LegacyMountGuard] blocked ${name} on ${pathname}`);
      return null;
    }
    return <Component {...props} />;
  };
  Guarded.displayName = `LegacyGuard(${name})`;
  return Guarded;
}

/**
 * withDeprecationLog — non-blocking runtime breadcrumb for pages/components
 * scheduled for deletion in the System Consolidation Plan. Lets us verify
 * zero real traffic before removing source.
 *
 * Usage:  export default withDeprecationLog('PlayHub', PlayHub);
 */
export function withDeprecationLog<P extends object>(
  name: string,
  Component: ComponentType<P>,
): ComponentType<P> {
  const Tracked = (props: P) => {
    const { pathname } = useLocation();
    useEffect(() => {
      // eslint-disable-next-line no-console
      console.warn(`[Deprecated] ${name} mounted at ${pathname} — slated for deletion (see .lovable/plan.md)`);
    }, [pathname]);
    return <Component {...props} />;
  };
  Tracked.displayName = `Deprecated(${name})`;
  return Tracked;
}
