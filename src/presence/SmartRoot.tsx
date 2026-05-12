/**
 * SmartRoot — what `/` renders.
 *
 * Correction (post Phase 3.2): the homepage is the AION chat-first surface,
 * NOT the room-card / state-space PresenceShell. Authenticated users land
 * directly inside the conversation with AION (`/aurora`). Rooms, the graph,
 * journal, missions, hypnosis, habits and stats are summoned BY AION or
 * opened as overlays/lenses — never rendered as the default homepage.
 *
 * Unauthenticated visitors still see the public marketing Index.
 */
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useShellV2Enabled } from '@/lib/clientFlags';
import ShellV2 from '@/shellv2/ShellV2';

const Index = lazy(() => import('@/pages/Index'));

export default function SmartRoot() {
  const { user, loading } = useAuth();
  const shellV2 = useShellV2Enabled();
  if (loading) return <PageSkeleton />;
  // Phase 6: ShellV2 is the default OS surface for authenticated users.
  // Visit `?ff_shell_v2=0` to fall back to the legacy `/aurora` shell.
  if (user) {
    if (shellV2) return <ShellV2 />;
    return <Navigate to="/aurora" replace />;
  }
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Index />
    </Suspense>
  );
}
