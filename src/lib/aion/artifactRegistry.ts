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
  // Phase 2 — legacy hubs as artifacts.
  journal: lazy(() => import('@/components/artifacts/kinds/JournalArtifact')),
  hypnosis: lazy(() => import('@/components/artifacts/kinds/HypnosisArtifact')),
  'business-dashboard': lazy(() => import('@/components/artifacts/kinds/BusinessDashboardArtifact')),
  'business-journey': lazy(() => import('@/components/artifacts/kinds/BusinessJourneyArtifact')),
  freelancer: lazy(() => import('@/components/artifacts/kinds/FreelancerArtifact')),
  creator: lazy(() => import('@/components/artifacts/kinds/CreatorArtifact')),
  therapist: lazy(() => import('@/components/artifacts/kinds/TherapistArtifact')),
  'pillar-assess': lazy(() => import('@/components/artifacts/kinds/PillarAssessArtifact')),
  'pillar-results': lazy(() => import('@/components/artifacts/kinds/PillarResultsArtifact')),
  'pillar-history': lazy(() => import('@/components/artifacts/kinds/PillarHistoryArtifact')),
  quest: lazy(() => import('@/components/artifacts/kinds/QuestArtifact')),
  missions: lazy(() => import('@/components/artifacts/kinds/MissionsArtifact')),
  'profile-stats': lazy(() => import('@/components/artifacts/kinds/ProfileStatsArtifact')),
};
