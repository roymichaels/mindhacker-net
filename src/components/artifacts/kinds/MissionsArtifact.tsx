import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
const PlayLayoutWrapper = lazy(() => import('@/components/play/PlayLayoutWrapper').catch(() => ({ default: () => null })));
export default function MissionsArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><PlayLayoutWrapper /></div></Suspense>;
}
