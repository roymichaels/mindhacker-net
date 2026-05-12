import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

export default function BusinessCanvasArtifact({ params }: ArtifactComponentProps) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      BusinessCanvasArtifact placeholder. params: {JSON.stringify(params)}
    </div>
  );
}
