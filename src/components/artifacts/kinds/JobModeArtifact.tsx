import type { ArtifactComponentProps } from '@/lib/aion/artifactRegistry';

export default function JobModeArtifact({ params }: ArtifactComponentProps) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      JobModeArtifact placeholder. params: {JSON.stringify(params)}
    </div>
  );
}
