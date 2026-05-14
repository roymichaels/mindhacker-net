import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
const JournalingHub = lazy(() => import('@/pages/JournalingHub'));
export default function JournalArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><JournalingHub /></div></Suspense>;
}
