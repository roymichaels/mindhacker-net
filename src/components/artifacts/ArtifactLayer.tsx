import { Suspense, useEffect, useState } from 'react';
import { artifactBus, type ArtifactInstance } from '@/lib/aion/artifactBus';
import { artifactRegistry } from '@/lib/aion/artifactRegistry';
import ArtifactFrame from './ArtifactFrame';

export default function ArtifactLayer() {
  const [artifacts, setArtifacts] = useState<ArtifactInstance[]>(() => artifactBus.list());

  useEffect(() => artifactBus.subscribe(setArtifacts), []);

  if (artifacts.length === 0) return null;

  return (
    <div className="px-3 pb-3 space-y-3">
      {artifacts.map((art) => {
        const Comp = artifactRegistry[art.kind];
        if (!Comp) {
          // eslint-disable-next-line no-console
          console.warn('[ArtifactLayer] unknown artifact kind', art.kind);
          queueMicrotask(() => artifactBus.dismiss(art.id));
          return null;
        }
        const close = () => artifactBus.dismiss(art.id);
        return (
          <ArtifactFrame
            key={art.id}
            title={art.kind}
            onClose={close}
            defaultFullscreen={art.fullscreen}
          >
            <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
              <Comp params={art.params} onClose={close} />
            </Suspense>
          </ArtifactFrame>
        );
      })}
    </div>
  );
}