import { Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
import { BusinessJourneyWrapper } from '@/components/careers/business/BusinessLayoutWrapper';
export default function BusinessJourneyArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><BusinessJourneyWrapper /></div></Suspense>;
}
