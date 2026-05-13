import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

// Native empty card — no debug placeholder text. The real plan artifact
// renderer will replace this; until then we render nothing visible.
export default function PlanArtifact(_props: ArtifactComponentProps) {
  return null;
}
