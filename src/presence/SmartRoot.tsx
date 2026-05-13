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
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton';
import ShellV2 from '@/shellv2/ShellV2';
import { OnboardingGate } from '@/components/layout/OnboardingGate';

const Index = lazy(() => import('@/pages/Index'));

export default function SmartRoot() {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  // Authenticated `/` is ShellV2 — no legacy shell, no fallback.
  if (user) {
    return (
      <OnboardingGate>
        <ShellV2 />
      </OnboardingGate>
    );
  }
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Index />
    </Suspense>
  );
}
