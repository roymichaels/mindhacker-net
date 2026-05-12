/**
 * AssessmentArtifact — wraps DomainAssessChat as a summoned in-chat artifact.
 * params: { domainId: string }
 */
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

export default function AssessmentArtifact({ params, onClose }: ArtifactComponentProps) {
  const domainId = String(params.domainId ?? '');
  if (!domainId) return null;
  return (
    <DomainAssessChat
      domainId={domainId}
      asDock
      dockHeightVh={80}
      hideHeader
      onClose={onClose}
    />
  );
}
