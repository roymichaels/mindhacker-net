/**
 * SummonRoute — Phase 5 of ShellV2.
 *
 * Wraps legacy page routes so they no longer render their own shells when
 * `ff_shell_v2` is enabled. Instead, the route mounts ShellV2 and summons
 * the matching artifact through `artifactBus`. The chat surface remains the
 * persistent OS; the artifact appears inline above the composer.
 *
 * When the flag is OFF, `fallback` renders unchanged so production stays
 * intact during the migration.
 */
import { useEffect } from 'react';
import ShellV2 from './ShellV2';
import { artifactBus, type ArtifactKind } from '@/lib/aion/artifactBus';
import { useClientFlag } from '@/lib/clientFlags';

interface SummonRouteProps {
  kind: ArtifactKind;
  params?: Record<string, unknown>;
  fullscreen?: boolean;
  /** Legacy page rendered when ff_shell_v2 is OFF. */
  fallback: React.ReactNode;
}

export default function SummonRoute({ kind, params, fullscreen, fallback }: SummonRouteProps) {
  const enabled = useClientFlag('shell_v2');

  useEffect(() => {
    if (!enabled) return;
    const id = artifactBus.summon(kind, params ?? {}, { fullscreen, replaceKind: true });
    return () => artifactBus.dismiss(id);
  }, [enabled, kind, fullscreen, JSON.stringify(params ?? {})]);

  if (!enabled) return <>{fallback}</>;
  return <ShellV2 />;
}
