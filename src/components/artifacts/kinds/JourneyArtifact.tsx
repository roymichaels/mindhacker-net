import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

export default function JourneyArtifact({ params }: ArtifactComponentProps) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      JourneyArtifact placeholder. params: {JSON.stringify(params)}
    </div>
  );
}
