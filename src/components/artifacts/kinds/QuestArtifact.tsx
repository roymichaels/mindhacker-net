import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
const QuestRunnerPage = lazy(() => import('@/pages/QuestRunnerPage'));
export default function QuestArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><QuestRunnerPage /></div></Suspense>;
}
