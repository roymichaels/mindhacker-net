/**
 * ScaffoldScene — registered placeholder used by `scaffold` worlds.
 *
 * Renders the world's metaphor sentence, AION's role inside the world,
 * and a soft pulse — so the world feels conceptually present without
 * faking depth. Distinct from a generic "coming soon" lock.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import type { CognitiveWorld } from '@/worlds/types';

const ROLE_LABEL_HE: Record<string, string> = {
  guide: 'מלווה',
  interpreter: 'מפרש',
  orchestrator: 'מתזמן',
  observer: 'צופה',
};
const ROLE_LABEL_EN: Record<string, string> = {
  guide: 'guide',
  interpreter: 'interpreter',
  orchestrator: 'orchestrator',
  observer: 'observer',
};

export default function ScaffoldScene({ world }: { world: CognitiveWorld }) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const metaphor = isHe ? world.scene.metaphorHe : world.scene.metaphorEn;
  const role = (isHe ? ROLE_LABEL_HE : ROLE_LABEL_EN)[world.aionRole];
  const accent = `hsl(${world.scene.accentHsl})`;

  return (
    <div className="relative flex flex-col items-center justify-center py-10 gap-6">
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}26, transparent 60%)`,
        }}
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative text-center space-y-2 max-w-sm px-6">
        <p className="text-[11px] uppercase tracking-[0.32em] text-foreground/45">
          {isHe ? 'מטאפורת העולם' : 'World metaphor'}
        </p>
        <p className="text-[16px] text-foreground/85 leading-snug">{metaphor}</p>
      </div>
      <div
        className="relative w-20 h-20 rounded-full border border-white/[0.08]"
        style={{ boxShadow: `inset 0 0 30px ${accent}55` }}
      >
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative text-center space-y-1">
        <p className="text-[11px] uppercase tracking-[0.32em] text-foreground/45">
          {isHe ? 'תפקיד AION' : 'AION role'}
        </p>
        <p className="text-[14px] text-foreground/75">
          {isHe ? `AION כאן בתור ${role}` : `AION is here as ${role}`}
        </p>
      </div>
      <p className="relative text-[11px] text-foreground/40 italic">
        {isHe ? 'העולם הזה עדיין מתגלם' : 'This world is still taking shape'}
      </p>
    </div>
  );
}
