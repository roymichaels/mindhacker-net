import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

export default function LandingBuilderArtifact({ params }: ArtifactComponentProps) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      LandingBuilderArtifact placeholder. params: {JSON.stringify(params)}
    </div>
  );
}
