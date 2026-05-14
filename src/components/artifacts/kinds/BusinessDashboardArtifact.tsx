import { Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
import { BusinessDashboardWrapper } from '@/components/careers/business/BusinessLayoutWrapper';
export default function BusinessDashboardArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><div className="min-h-[60vh]"><BusinessDashboardWrapper /></div></Suspense>;
}
