import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PersonalizedOrb } from '@/components/orb';
import { cn } from '@/lib/utils';
import { useStoryWorld } from '@/contexts/StoryWorldContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

interface StoryWorldShellProps {
  compact?: boolean;
  className?: string;
}

export function StoryWorldShell({ compact = false, className }: StoryWorldShellProps) {
  const { scene, loading } = useStoryWorld();
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.04] transition-all duration-700"
        style={{ backgroundImage: `url("${scene.imageUrl}")` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(2,6,23,0.2) 0%, ${scene.theme.overlay} 72%, rgba(2,6,23,0.96) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${scene.theme.glow} 0%, transparent 38%), radial-gradient(circle at 80% 32%, ${scene.theme.secondary}22 0%, transparent 28%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-center px-6',
          compact ? 'top-16 max-w-2xl' : 'top-20 max-w-3xl'
        )}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 backdrop-blur-xl text-[11px] font-semibold tracking-[0.18em] text-cyan-100 uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          {scene.chapterKey.replace(/_/g, ' ')}
        </div>
        <h1 className={cn('mt-4 font-black text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)]', compact ? 'text-2xl' : 'text-3xl md:text-5xl')}>
          {scene.headline}
        </h1>
        <p className={cn('mt-3 text-white/80 max-w-2xl', compact ? 'text-sm' : 'text-sm md:text-base')}>
          {scene.body}
        </p>
        {loading ? (
          <div className="mt-3 text-xs text-white/55">{isHe ? 'טוען את הסצנה...' : 'Loading the scene...'}</div>
        ) : null}
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center',
          compact ? 'bottom-36' : 'bottom-40 md:bottom-32'
        )}
      >
        <div className="absolute inset-[-60px] rounded-full blur-3xl" style={{ background: scene.theme.glow }} />
        <PersonalizedOrb size={compact ? 120 : 180} renderer="css" state="breathing" />
        {/* Hide the presence message when onboarding skips the story background */}
        {(() => {
          const skip = typeof window !== 'undefined' && (window as any).__skipStoryWorld;
          if (skip) return null;
          return user ? (
            <div className="mt-4 rounded-full border border-white/10 bg-slate-950/45 px-4 py-1.5 text-xs text-white/80 backdrop-blur-xl">
              {isHe ? 'הנוכחות שלך בעולם' : 'Your hero presence in the world'}
            </div>
          ) : null;
        })()}
      </motion.div>
    </div>
  );
}

export default StoryWorldShell;
