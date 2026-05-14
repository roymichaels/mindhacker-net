import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAionManifestation } from './useAionManifestation';
import type { AnyManifestationKind } from './moods';

interface Props {
  artifactId: string;
  kind?: AnyManifestationKind;
  className?: string;
  children: ReactNode;
  /** Fired once the dissolve animation completes. Allows parent to unmount. */
  onDissolved?: () => void;
}

/**
 * Visual lifecycle wrapper. Pure CSS, transform/opacity/filter only —
 * no layout jump. Reduced-motion collapses to a fast opacity fade.
 */
export function ManifestedArtifactShell({
  artifactId,
  kind,
  className,
  children,
  onDissolved,
}: Props) {
  const { phase, reducedMotion } = useAionManifestation(artifactId, kind);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (phase !== 'dissolving') return;
    const t = window.setTimeout(() => {
      setShouldRender(false);
      onDissolved?.();
    }, reducedMotion ? 80 : 240);
    return () => window.clearTimeout(t);
  }, [phase, reducedMotion, onDissolved]);

  if (!shouldRender) return null;

  const animClass = reducedMotion
    ? phase === 'manifesting'
      ? 'aion-manifest-reduced-in'
      : phase === 'dissolving'
      ? 'aion-manifest-reduced-out'
      : ''
    : phase === 'manifesting'
    ? 'aion-manifest-in'
    : phase === 'dissolving'
    ? 'aion-manifest-out'
    : '';

  return (
    <div className={cn('will-change-transform', animClass, className)}>
      {children}
    </div>
  );
}

export default ManifestedArtifactShell;