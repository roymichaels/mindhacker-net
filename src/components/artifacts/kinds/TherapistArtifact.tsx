import { Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
import TherapistLayoutWrapper from '@/components/careers/therapist/TherapistLayoutWrapper';
export default function TherapistArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><TherapistLayoutWrapper /></div></Suspense>;
}
