import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
const LifeDomainPage = lazy(() => import('@/pages/LifeDomainPage'));
// Generic pillar surface — params.pillar identifies the domain via URL params already.
export default function PillarAssessArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><LifeDomainPage /></div></Suspense>;
}
