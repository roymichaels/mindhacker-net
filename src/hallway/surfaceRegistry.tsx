/**
 * Surface registry — resolves a surface ID (declared in `rooms.ts`) into a
 * React component to render inside a room.
 *
 * Surfaces are NOT routes. A room composes one or more surfaces side by side;
 * a surface is a self-contained interactive unit (a journal, a hypnosis
 * launcher, a parts dialogue, a timeline). When a surface ID has no registered
 * implementation we render a small placeholder so the room remains intact.
 *
 * To register a surface: add an entry below mapping the surface ID to a lazy
 * import. Keep surfaces small and focused — large existing pages can be
 * wrapped, but new surfaces should be authored against this contract from the
 * start.
 */
import { lazy, Suspense, type ComponentType } from 'react';

type SurfaceComponent = ComponentType<{ roomId: string }>;

const REGISTRY: Record<string, () => Promise<{ default: SurfaceComponent }>> = {
  'body.hypnosis': () => import('./surfaces/BodyHypnosisSurface'),
};

const cache = new Map<string, ComponentType<{ roomId: string }>>();

function resolve(surfaceId: string): ComponentType<{ roomId: string }> | null {
  if (cache.has(surfaceId)) return cache.get(surfaceId)!;
  const loader = REGISTRY[surfaceId];
  if (!loader) return null;
  const Lazy = lazy(loader);
  cache.set(surfaceId, Lazy);
  return Lazy;
}

interface SurfaceProps {
  surfaceId: string;
  roomId: string;
  fallback: React.ReactNode;
}

export function Surface({ surfaceId, roomId, fallback }: SurfaceProps) {
  const Component = resolve(surfaceId);
  if (!Component) return <>{fallback}</>;
  return (
    <Suspense fallback={fallback}>
      <Component roomId={roomId} />
    </Suspense>
  );
}

export function isSurfaceImplemented(surfaceId: string): boolean {
  return surfaceId in REGISTRY;
}