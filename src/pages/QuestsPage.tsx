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
    <div className="min-h-screen bg-background p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === 'he' ? 'משימות הגילוי' : 'Discovery Quests'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'he'
              ? 'צלול לעומק כל תחום בחיים שלך'
              : 'Dive deeper into each area of your life'}
          </p>
        </div>

        {/* Quest Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  "relative flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isCompleted
                    ? "border-primary/40 bg-primary/5"
                    : isInProgress
                      ? "border-primary/20 bg-card"
                      : "border-border bg-card"
                )}
              >
                {/* Icon */}
                <span className="text-3xl shrink-0">{pillar.icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-lg leading-tight">
                    {language === 'he' ? pillar.title_he : pillar.title_en}
                  </h3>
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-primary text-sm">
                      <CheckCircle2 className="w-4 h-4" />
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
                      <span className="text-xs text-muted-foreground">
                        {progress.answered}/{progress.total}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {language === 'he' ? 'טרם התחיל' : 'Not started'}
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className={cn("w-5 h-5 text-muted-foreground shrink-0", isRTL && "rotate-180")} />

                {/* Completed badge */}
                {isCompleted && (
                  <div className="absolute -top-2 -end-2 bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
