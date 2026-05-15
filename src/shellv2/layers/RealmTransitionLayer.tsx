/**
 * RealmTransitionLayer — Phase 5N.1.
 *
 * Single-DOM-node atmospheric scrim that bridges realm-to-realm traversal.
 * Two stacked radial veils tinted by the source/target realm mood. Opacity
 * driven entirely by transition phase; no canvas, no RAF.
 */
import { useRealmTransition } from '../transitions/realmTransitionBus';
import { REALM_MOOD } from '@/aion/realms/realmMood';
import { zStyle } from '../zindex';

export default function RealmTransitionLayer() {
  const t = useRealmTransition();
  const fromMood = t.from ? REALM_MOOD[t.from] : null;
  const toMood = t.to ? REALM_MOOD[t.to] : null;

  // Phase → veil opacities.
  const fromAlpha = t.phase === 'departing' ? 0.45 : 0;
  const toAlpha = t.phase === 'arriving' ? 0.55 + Math.min(0.25, t.energy * 0.25) : 0;
  const dim = t.phase === 'idle' ? 0 : 0.35;

  return (
    <div
      aria-hidden
      style={{
        ...zStyle('realmVeil'),
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* dim wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'hsl(var(--background) / 1)',
          opacity: dim,
          transition: 'opacity 240ms ease',
        }}
      />
      {/* departing realm hue */}
      {fromMood && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 120% at 50% 60%, hsl(${fromMood.hue.primary} / 0.35) 0%, hsl(${fromMood.hue.accent} / 0.18) 45%, transparent 75%)`,
            opacity: fromAlpha,
            transition: 'opacity 220ms ease-out',
            mixBlendMode: 'screen',
          }}
        />
      )}
      {/* arriving realm hue */}
      {toMood && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 120% at 50% 50%, hsl(${toMood.hue.primary} / 0.45) 0%, hsl(${toMood.hue.accent} / 0.22) 50%, transparent 80%)`,
            opacity: toAlpha,
            transition: 'opacity 320ms ease-in',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
}
