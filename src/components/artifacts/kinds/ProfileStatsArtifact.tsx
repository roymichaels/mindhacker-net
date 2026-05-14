import { lazy, Suspense } from 'react';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
// ProfilePage is a portal-ed modal — opening it via openProfile() is preferred,
// but as an artifact it self-renders if `isOpen` is set.
export default function ProfileStatsArtifact(_p: ArtifactComponentProps) {
  return <Suspense fallback={null}><ProfilePage /></Suspense>;
}
