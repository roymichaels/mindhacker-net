/**
 * artifactRegistry — kind → lazy React component map.
 *
 * Each artifact kind is a thin wrapper around an *existing* surface so we
 * avoid rewriting tools while routing them through one mount point.
 * Adding a new artifact = add an entry here + a wrapper file.
 */
import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import type { ArtifactKind } from './artifactBus';

export interface ArtifactComponentProps {
  params: Record<string, unknown>;
  onClose: () => void;
}

type ArtifactComponent = ComponentType<ArtifactComponentProps>;

export const artifactRegistry: Record<
  ArtifactKind,
  LazyExoticComponent<ArtifactComponent>
> = {
  assessment: lazy(() => import('@/components/artifacts/kinds/AssessmentArtifact')),
  'today-list': lazy(() => import('@/components/artifacts/kinds/TodayListArtifact')),
  plan: lazy(() => import('@/components/artifacts/kinds/PlanArtifact')),
  journey: lazy(() => import('@/components/artifacts/kinds/JourneyArtifact')),
  'landing-builder': lazy(() => import('@/components/artifacts/kinds/LandingBuilderArtifact')),
  'business-canvas': lazy(() => import('@/components/artifacts/kinds/BusinessCanvasArtifact')),
  'job-mode': lazy(() => import('@/components/artifacts/kinds/JobModeArtifact')),
};
