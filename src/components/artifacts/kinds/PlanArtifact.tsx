import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

export default function PlanArtifact({ params }: ArtifactComponentProps) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      PlanArtifact placeholder. params: {JSON.stringify(params)}
    </div>
  );
}
