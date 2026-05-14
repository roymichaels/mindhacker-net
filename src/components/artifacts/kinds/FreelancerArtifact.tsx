import { Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
import FreelancerLayoutWrapper from '@/components/careers/freelancer/FreelancerLayoutWrapper';
export default function FreelancerArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><FreelancerLayoutWrapper /></div></Suspense>;
}
