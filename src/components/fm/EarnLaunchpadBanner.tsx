/**
 * EarnLaunchpadBanner — Persistent banner across all FM tabs until launchpad is 100% complete.
 * Clicking opens the launchpad modal instead of navigating.
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EarnLaunchpadModal } from '@/components/fm/EarnLaunchpadModal';

const TOTAL_MILESTONES = 10;

export function EarnLaunchpadBanner() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [modalOpen, setModalOpen] = useState(false);

  const { data: progress } = useQuery({
    queryKey: ['earn-launchpad', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('earn_launchpad_progress')
        .select('milestones_completed')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const completedMilestones: string[] = (progress?.milestones_completed as string[]) || [];
  const completedCount = completedMilestones.length;
  const progressPercent = Math.round((completedCount / TOTAL_MILESTONES) * 100);

  // Hide if complete
  if (progressPercent >= 100) return null;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setModalOpen(true)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
          'bg-gradient-to-r from-amber-500/5 to-primary/5',
          'border-amber-500/20 hover:border-amber-500/40',
          'hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
          'group'
        )}
      >
        {/* Icon */}
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <Rocket className="w-4 h-4 text-amber-500" />
        </div>

        {/* Content — single compact row */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-xs font-bold text-foreground whitespace-nowrap">
            {isHe ? 'לאנצ׳פד הרווחה' : 'Earn Launchpad'}
          </span>
          <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded shrink-0">
            {completedCount}/{TOTAL_MILESTONES}
          </span>
          <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden min-w-[60px]">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            {isHe
              ? `${progressPercent}% הושלם — המשך להרוויח`
              : `${progressPercent}% complete — keep earning`}
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </motion.button>

      <EarnLaunchpadModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
