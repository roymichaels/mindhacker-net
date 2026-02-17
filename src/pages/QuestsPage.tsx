/**
 * QuestsPage — Hub for 8 Pillar Quests
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { PILLAR_QUESTS } from '@/flows/pillarSpecs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFlowSpec } from '@/lib/flow/flowSpec';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { SectionHeader } from '@/components/aurora-ui/SectionHeader';

interface PillarQuestData {
  completed?: boolean;
  completedAt?: string;
  answers?: Record<string, unknown>;
}

export default function QuestsPage() {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: questsData } = useQuery({
    queryKey: ['pillar-quests', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const profileData = data?.step_2_profile_data as Record<string, unknown> | null;
      return (profileData?.pillar_quests as Record<string, PillarQuestData>) ?? {};
    },
    enabled: !!user,
  });

  const getQuestStatus = (pillarId: string) => {
    const quest = questsData?.[pillarId];
    if (!quest) return 'not_started';
    if (quest.completed) return 'completed';
    if (quest.answers && Object.keys(quest.answers).length > 0) return 'in_progress';
    return 'not_started';
  };

  const getQuestProgress = (pillarId: string) => {
    const quest = questsData?.[pillarId];
    if (!quest?.answers) return { answered: 0, total: 0 };
    const spec = getFlowSpec(`quest-${pillarId}`);
    if (!spec) return { answered: 0, total: 0 };
    const total = spec.steps[0]?.miniSteps.length ?? 0;
    const answered = Object.keys(quest.answers).length;
    return { answered, total };
  };

  return (
    <PageShell className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon={Sparkles}
        title={language === 'he' ? 'משימות הגילוי' : 'Discovery Quests'}
        subtitle={language === 'he' ? 'צלול לעומק כל תחום בחיים שלך' : 'Dive deeper into each area of your life'}
      />

      {/* Quest Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PILLAR_QUESTS.map((pillar, idx) => {
          const status = getQuestStatus(pillar.id);
          const progress = getQuestProgress(pillar.id);
          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <motion.button
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/quests/${pillar.id}`)}
              className={cn(
                'relative flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all min-h-[44px]',
                'hover:shadow-md hover:scale-[1.02]',
                isCompleted
                  ? 'border-primary/40 bg-primary/5'
                  : isInProgress
                    ? 'border-primary/20 bg-card shadow-sm'
                    : 'border-border bg-card shadow-sm'
              )}
            >
              {/* Icon */}
              <span className="text-3xl">{pillar.icon}</span>

              {/* Content */}
              <div className="space-y-1 w-full">
                <h3 className="font-semibold text-sm leading-tight">
                  {language === 'he' ? pillar.title_he : pillar.title_en}
                </h3>
                {isCompleted ? (
                  <div className="flex items-center justify-center gap-1 text-primary text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'he' ? 'הושלם' : 'Completed'}
                  </div>
                ) : progress.total > 0 ? (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 transition-all"
                        style={{ width: `${(progress.answered / progress.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {progress.answered}/{progress.total}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    {language === 'he' ? 'טרם התחיל' : 'Not started'}
                  </span>
                )}
              </div>

              {/* Completed badge */}
              {isCompleted && (
                <div className="absolute -top-2 -end-2 bg-primary text-primary-foreground rounded-full p-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Back button */}
      <div className="text-center">
        <Button variant="ghost" onClick={() => navigate('/today')}>
          {language === 'he' ? 'חזרה לדשבורד' : 'Back to Dashboard'}
        </Button>
      </div>
    </PageShell>
  );
}
