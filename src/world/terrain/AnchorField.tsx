/**
 * AnchorField — Phase 5D.1.
 *
 * Lays out the world's cognitive anchors over the terrain. Renders
 * EnergyPaths between linked anchors first (so they sit behind pins),
 * then the AnchorPins themselves. Parallax is inherited from a parent
 * so all field elements drift together.
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { AnchorPin, EnergyPath } from '@/universe';
import type { ParallaxOffset } from '@/universe';
import { useWorldAnchors } from './useWorldAnchors';

interface Props {
  parallax?: ParallaxOffset;
}

export default function AnchorField({ parallax }: Props) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const anchors = useWorldAnchors();
  const byId = new Map(anchors.map((a) => [a.id, a] as const));

  return (
    <div
      className="absolute inset-0"
      style={{
        // Field-wide parallax — all pins/paths shift together.
        transform: `translate(${(parallax?.x ?? 0) * -8}px, ${(parallax?.y ?? 0) * -6}px)`,
        transition: 'transform 1400ms cubic-bezier(0.22,0.61,0.36,1)',
      }}
    >
      {/* Energy bridges — drawn first so pins overlay them. */}
      {anchors.flatMap((a) =>
        (a.links ?? []).flatMap((toId) => {
          const dst = byId.get(toId);
          if (!dst) return [];
          return [
            <EnergyPath
              key={`${a.id}-${toId}`}
              from={{ x: a.x, y: a.y }}
              to={{ x: dst.x, y: dst.y }}
              hueHsl={a.hueHsl}
              intensity={0.45}
            />,
          ];
        }),
      )}

      {/* Pins themselves. */}
      {anchors.map((a, i) => {
        const Icon = a.icon;
        return (
          <AnchorPin
            key={a.id}
            x={a.x}
            y={a.y}
            icon={<Icon className="h-5 w-5" strokeWidth={1.5} />}
            label={isHe ? a.labelHe : a.labelEn}
            meta={isHe ? a.metaHe : a.metaEn}
            hueHsl={a.hueHsl}
            delay={0.18 + i * 0.12}
            rtl={isRTL}
            parallax={parallax}
            depth={18}
            onActivate={() => navigate(a.to)}
          />
        );
      })}
    </div>
  );
}