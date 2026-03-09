/**
 * EarnLaunchpadBanner — Persistent banner across all FM tabs until launchpad is 100% complete.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TOTAL_MILESTONES = 10;

export function EarnLaunchpadBanner() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const location = useLocation();

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

  // Hide if complete or on earn page (redundant)
  const isOnEarnPage = location.pathname === '/fm/earn' || location.pathname === '/fm';
  if (progressPercent >= 100 || isOnEarnPage) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/fm/earn')}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
        'bg-gradient-to-r from-amber-500/5 to-primary/5',
        'border-amber-500/20 hover:border-amber-500/40',
        'hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
        'group'
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
        <Rocket className="w-5 h-5 text-amber-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-start">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {isHe ? 'לאנצ׳פד הרווחה' : 'Earn Launchpad'}
          </span>
          <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
            {completedCount}/{TOTAL_MILESTONES}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {isHe
            ? `${progressPercent}% הושלם — המשך להרוויח`
            : `${progressPercent}% complete — keep earning`}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </motion.button>
  );
}
