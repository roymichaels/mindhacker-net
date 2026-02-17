import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Activity, Brain, Target, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  initialTab?: string;
}

interface DiagnosticScore {
  key: string;
  label: string;
  labelEn: string;
  value: number;
  interpretation: string;
  interpretationEn: string;
  icon: typeof Zap;
  color: string;
  bgColor: string;
}

export function DiagnosticsModal({ open, onOpenChange, language, initialTab }: DiagnosticsModalProps) {
  const { user } = useAuth();
  const [scores, setScores] = useState<DiagnosticScore[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = language === 'he';

  useEffect(() => {
    if (!user || !open) return;
    setLoading(true);

    async function fetchScores() {
      try {
        const { data } = await supabase
          .from('launchpad_summaries')
          .select('summary_data')
          .eq('user_id', user!.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.summary_data) {
          const sd = data.summary_data as any;
          const diag = sd.diagnostics || sd.diagnostic_scores || {};
          const w1 = sd.week1_protocol || {};

          const scoresList: DiagnosticScore[] = [
            {
              key: 'energy_stability',
              label: 'יציבות אנרגיה',
              labelEn: 'Energy Stability',
              value: diag.energy_stability?.score ?? diag.nervous_system_score ?? 0,
              interpretation: diag.energy_stability?.interpretation || sd.nervous_system?.interpretation || 'לא זמין',
              interpretationEn: diag.energy_stability?.interpretation_en || 'Not available',
              icon: Zap,
              color: 'text-amber-500',
              bgColor: 'bg-amber-500/10',
            },
            {
              key: 'recovery_debt',
              label: 'חוב ריקברי',
              labelEn: 'Recovery Debt',
              value: diag.recovery_debt?.score ?? diag.recovery_debt_score ?? 0,
              interpretation: diag.recovery_debt?.interpretation || 'לא זמין',
              interpretationEn: diag.recovery_debt?.interpretation_en || 'Not available',
              icon: Activity,
              color: 'text-red-500',
              bgColor: 'bg-red-500/10',
            },
            {
              key: 'dopamine_load',
              label: 'עומס דופמין',
              labelEn: 'Dopamine Load',
              value: diag.dopamine_load?.score ?? diag.dopamine_load_score ?? 0,
              interpretation: diag.dopamine_load?.interpretation || 'לא זמין',
              interpretationEn: diag.dopamine_load?.interpretation_en || 'Not available',
              icon: Brain,
              color: 'text-purple-500',
              bgColor: 'bg-purple-500/10',
            },
            {
              key: 'execution_reliability',
              label: 'אמינות ביצוע',
              labelEn: 'Execution Reliability',
              value: diag.execution_reliability?.score ?? diag.execution_reliability_score ?? 0,
              interpretation: diag.execution_reliability?.interpretation || 'לא זמין',
              interpretationEn: diag.execution_reliability?.interpretation_en || 'Not available',
              icon: Target,
              color: 'text-green-500',
              bgColor: 'bg-green-500/10',
            },
            {
              key: 'time_leverage',
              label: 'מינוף זמן',
              labelEn: 'Time Leverage',
              value: diag.time_leverage?.score ?? diag.time_optimization_score ?? 0,
              interpretation: diag.time_leverage?.interpretation || 'לא זמין',
              interpretationEn: diag.time_leverage?.interpretation_en || 'Not available',
              icon: Clock,
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10',
            },
            {
              key: 'hormonal_risk',
              label: 'סיכון הורמונלי',
              labelEn: 'Hormonal Risk',
              value: diag.hormonal_risk?.score ?? diag.hormonal_risk_score ?? 0,
              interpretation: diag.hormonal_risk?.interpretation || 'לא זמין',
              interpretationEn: diag.hormonal_risk?.interpretation_en || 'Not available',
              icon: Activity,
              color: 'text-orange-500',
              bgColor: 'bg-orange-500/10',
            },
          ];

          setScores(scoresList);
        }
      } catch (err) {
        console.error('Error fetching diagnostics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [user, open]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    if (score >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader
          title={isRTL ? 'אבחון מערכתי' : 'System Diagnostics'}
          icon={<Activity className="h-5 w-5" />}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'השלם את המסע לקבל את הציונים האבחוניים שלך' : 'Complete the intake to get your diagnostic scores'}
            </p>
          </div>
        ) : (
          <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
            {scores.map((score) => {
              const Icon = score.icon;
              return (
                <div
                  key={score.key}
                  className={cn(
                    "rounded-xl border border-border/50 p-4 space-y-2",
                    initialTab === score.key && "ring-2 ring-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-2 rounded-lg", score.bgColor)}>
                        <Icon className={cn("w-4 h-4", score.color)} />
                      </div>
                      <span className="text-sm font-semibold">
                        {isRTL ? score.label : score.labelEn}
                      </span>
                    </div>
                    <span className={cn("text-xl font-bold tabular-nums", getScoreColor(score.value))}>
                      {score.value}
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", getBarColor(score.value))}
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                  {/* Interpretation */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isRTL ? score.interpretation : score.interpretationEn}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
