import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
const HypnosisPage = lazy(() => import('@/pages/HypnosisPage'));
export default function HypnosisArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><HypnosisPage /></div></Suspense>;
}
