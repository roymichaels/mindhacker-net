/**
 * TerrainValleyLayer — Phase 5D.1B.
 *
 * Pure-CSS/SVG textured valley occupying the lower ~60% of the
 * viewport. Three distance bands of ridges (far → near) with
 * progressive opacity + blur, a perspective ground plane, and a slow
 * drifting fog band tied to `--view-drift`. No assets, no canvas.
 *
 * Sits one slice below `UZ.structure` so the planet rim still reads as
 * the dominant horizon.
 */
import { UZ } from '@/universe/depth/zindex';

export interface TerrainValleyLayerProps {
  /** Mid-plane parallax. */
  parallax?: { x: number; y: number };
}

/**
 * SVG ridge silhouette generator. Returns a closed path string for a
 * smooth, low-frequency curve baseline at `baseY` with `amp` amplitude.
 * Width 100, height 100.
 */
function ridgePath(baseY: number, amp: number, seed: number): string {
  // 6 control points across — gentle peaks, no jaggies.
  const pts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const x = (i / 6) * 100;
    // Deterministic pseudo-noise using sin combos.
    const n =
      Math.sin(i * 1.7 + seed) * 0.5 +
      Math.sin(i * 0.9 + seed * 2.3) * 0.35 +
      Math.sin(i * 2.6 + seed * 0.6) * 0.15;
    pts.push([x, baseY + n * amp]);
  }
  const segs = pts.map((p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `Q ${cx} ${prev[1]} ${p[0]} ${p[1]}`;
  });
  return `${segs.join(' ')} L 100 100 L 0 100 Z`;
}

export default function TerrainValleyLayer({ parallax }: TerrainValleyLayerProps) {
  const px = parallax?.x ?? 0;
  const py = parallax?.y ?? 0;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: UZ.structure - 1 }}
    >
      {/* Perspective ground plane — warm horizon bleed → deep navy near camera. */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '38vh',
          bottom: 0,
          background:
            'linear-gradient(180deg,' +
            ' hsl(var(--aion-magenta) / 0.10) 0%,' +
            ' hsl(258 40% 8% / 0.55) 25%,' +
            ' hsl(240 45% 5% / 0.85) 65%,' +
            ' hsl(240 50% 3%) 100%)',
        }}
      />

      {/* Faint texture overlay — tiny radial dots break the flat fill. */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '40vh',
          bottom: 0,
          opacity: 0.18,
          mixBlendMode: 'screen',
          backgroundImage:
            'radial-gradient(0.5px 0.5px at 14% 22%, hsl(var(--foreground) / 0.45), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 31% 48%, hsl(var(--foreground) / 0.38), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 48% 12%, hsl(var(--foreground) / 0.40), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 62% 64%, hsl(var(--foreground) / 0.35), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 78% 30%, hsl(var(--foreground) / 0.40), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 88% 58%, hsl(var(--foreground) / 0.35), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 22% 78%, hsl(var(--foreground) / 0.32), transparent 60%),' +
            'radial-gradient(0.5px 0.5px at 56% 88%, hsl(var(--foreground) / 0.30), transparent 60%)',
        }}
      />

      {/* Drifting fog band — slow horizontal sweep. */}
      <div
        className="absolute inset-x-[-20%]"
        style={{
          top: '42vh',
          height: '22vh',
          opacity: 0.35,
          filter: 'blur(28px)',
          animation: 'aion-drift-a calc(60s / var(--view-drift, 1)) ease-in-out infinite',
          background:
            'radial-gradient(60% 100% at 50% 50%, hsl(var(--aion-cyan) / 0.16), transparent 70%)',
        }}
      />

      {/* Three ridges — far, mid, near. SVG silhouettes with progressive blur. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0"
        style={{
          top: '40vh',
          bottom: 0,
          width: '100%',
          height: 'calc(100% - 40vh)',
          transform: `translate(${px * -4}px, ${py * -3}px)`,
          transition: 'transform 1600ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      >
        {/* FAR ridge */}
        <g style={{ filter: 'blur(1.2px)', opacity: 0.55 }}>
          <path
            d={ridgePath(38, 6, 1.1)}
            fill="hsl(258 35% 12% / 0.75)"
          />
        </g>
        {/* MID ridge */}
        <g style={{ filter: 'blur(0.7px)', opacity: 0.78 }}>
          <path
            d={ridgePath(58, 9, 2.7)}
            fill="hsl(248 38% 8% / 0.88)"
          />
        </g>
        {/* NEAR ridge */}
        <g style={{ opacity: 0.95 }}>
          <path
            d={ridgePath(78, 12, 4.3)}
            fill="hsl(240 45% 5% / 0.96)"
          />
        </g>
      </svg>
    </div>
  );
}