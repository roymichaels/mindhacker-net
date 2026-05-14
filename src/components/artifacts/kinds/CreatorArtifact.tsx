import { Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
import CreatorLayoutWrapper from '@/components/careers/creator/CreatorLayoutWrapper';
export default function CreatorArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><CreatorLayoutWrapper /></div></Suspense>;
}
