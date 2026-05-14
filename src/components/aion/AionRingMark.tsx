/**
 * AionRingMark — canonical static AION brand mark (glowing ring).
 *
 * Use for headers, app icons, splash, empty states, and small inline brand
 * surfaces. For *living* AION presence (chat avatar, voice mode, brain
 * center, thinking) keep using `OrbView` from `@/components/orb/v2/OrbView`.
 */
import ringSrc from '@/assets/aion-ring.png';
import { cn } from '@/lib/utils';

interface AionRingMarkProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function AionRingMark({
  size = 28,
  withWordmark = false,
  className,
  ariaLabel = 'AION',
}: AionRingMarkProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 select-none', className)}
      aria-label={ariaLabel}
      role="img"
    >
      <img
        src={ringSrc}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="block shrink-0"
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {withWordmark && (
        <span className="text-[15px] font-bold tracking-[0.18em] text-foreground/90">
          AION
        </span>
      )}
    </span>
  );
}

export default AionRingMark;