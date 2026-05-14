/**
 * PersistentWorldOrb — Phase 5C Wave 1.
 *
 * The orb is no longer mounted *inside* a world. It is mounted ONCE at the
 * app shell level and listens to the route. As the user crosses worlds the
 * orb glides between per-world `orbAnchor` positions while the environment
 * around it dissolves — making AION the only constant reality anchor.
 *
 * Outside `/worlds/:id` the component renders nothing; world surfaces still
 * mount their own AION presence (e.g. SelfWorld's BandStack) where needed.
 */
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { getAtmospherePreset } from '@/worlds/atmosphere/atmospherePresets';
import { getWorld } from '@/worlds/registry';
import type { CognitiveWorldId } from '@/worlds/types';

const BASE_SIZE = 180;

function parseWorldId(pathname: string): CognitiveWorldId | null {
  const m = pathname.match(/^\/worlds\/([^/?#]+)/);
  if (!m) return null;
  const world = getWorld(m[1]);
  return world ? (world.id as CognitiveWorldId) : null;
}

export default function PersistentWorldOrb() {
  const { pathname } = useLocation();
  const worldId = parseWorldId(pathname);

  // SelfWorld keeps its own band-stack presence — no floating orb there.
  const isBandStack = worldId === 'self';

  if (!worldId || isBandStack) {
    return <AnimatePresence />;
  }

  const preset = getAtmospherePreset(worldId);
  const size = Math.round(BASE_SIZE * preset.orbAnchor.scale);

  return (
    <AnimatePresence>
      <motion.div
        key="aion-persistent-orb"
        className="pointer-events-none fixed z-30"
        initial={false}
        animate={{
          left: `${preset.orbAnchor.x * 100}%`,
          top: `${preset.orbAnchor.y * 100}%`,
          width: size,
          height: size,
          x: -size / 2,
          y: -size / 2,
        }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: size, height: size }}
      >
        <div className="pointer-events-auto">
          <CanonicalAionModel size={size} ariaLabel="AION" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}