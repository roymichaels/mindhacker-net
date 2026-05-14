import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

// Self-contained "deep stats / legacy view" — does NOT depend on
// ProfileModalContext, so summoning via artifactBus always works.
const AdvancedProfileStats = lazy(() => import('@/components/self/AdvancedProfileStats'));

export default function ProfileStatsArtifact(_p: ArtifactComponentProps) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <AdvancedProfileStats />
    </Suspense>
  );
}