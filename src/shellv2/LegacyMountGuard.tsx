/**
 * LegacyMountGuard — runtime kill switch for legacy surfaces.
 *
 * If any banned legacy component tries to mount on a ShellV2-owned route
 * (`/`, `/aurora`, `/brain`, `/outer-world`), the guard logs the attempt
 * and returns null so no legacy DOM ever leaks under ShellV2.
 */
import { useLocation } from 'react-router-dom';
import type { ComponentType } from 'react';

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
