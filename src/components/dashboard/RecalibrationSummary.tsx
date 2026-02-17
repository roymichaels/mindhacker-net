/**
 * RecalibrationSummary - Shows the latest weekly recalibration results
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw } from 'lucide-react';

interface RecalibrationLog {
  id: string;
  week_number: number;
  compliance_score: number;
  cognitive_load_score: number;
  recovery_debt_score: number;
  adjustments_made: Record<string, unknown>;
  behavioral_risks: Array<{ risk: string; severity: string; action: string }>;
  created_at: string;
}

export function RecalibrationSummary() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const { data: recalib } = useQuery({
    queryKey: ['recalibration-latest', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('recalibration_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as unknown as RecalibrationLog | null;
    },
    enabled: !!user?.id,
  });

  if (!recalib) return null;

  const complianceLevel = recalib.compliance_score >= 70 ? 'high' : recalib.compliance_score >= 40 ? 'mid' : 'low';
  const risks = (recalib.behavioral_risks || []) as Array<{ risk: string; severity: string; action: string }>;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-semibold">
          {isHe ? `כיול שבועי — שבוע ${recalib.week_number}` : `Weekly Recalibration — Week ${recalib.week_number}`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <ScoreChip
          label={isHe ? 'ציות' : 'Compliance'}
          value={Math.round(recalib.compliance_score)}
          level={complianceLevel}
        />
        <ScoreChip
          label={isHe ? 'עומס' : 'Load'}
          value={Math.round(recalib.cognitive_load_score)}
          level={recalib.cognitive_load_score > 70 ? 'high' : recalib.cognitive_load_score > 40 ? 'mid' : 'low'}
          invertColor
        />
        <ScoreChip
          label={isHe ? 'חוב התאוששות' : 'Recovery Debt'}
          value={Math.round(recalib.recovery_debt_score)}
          level={recalib.recovery_debt_score > 60 ? 'high' : recalib.recovery_debt_score > 30 ? 'mid' : 'low'}
          invertColor
        />
      </div>

      {risks.length > 0 && (
        <div className="space-y-1">
          {risks.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px]">
              <AlertTriangle className={cn("w-3 h-3 shrink-0 mt-0.5", r.severity === 'high' ? 'text-red-500' : 'text-amber-500')} />
              <span className="text-muted-foreground">{r.risk}: {r.action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreChip({ label, value, level, invertColor }: { label: string; value: number; level: 'high' | 'mid' | 'low'; invertColor?: boolean }) {
  const color = invertColor
    ? (level === 'high' ? 'text-red-500' : level === 'mid' ? 'text-amber-500' : 'text-green-500')
    : (level === 'high' ? 'text-green-500' : level === 'mid' ? 'text-amber-500' : 'text-red-500');

  const Icon = invertColor
    ? (level === 'high' ? TrendingUp : level === 'mid' ? Minus : TrendingDown)
    : (level === 'high' ? TrendingUp : level === 'mid' ? Minus : TrendingDown);

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/30 p-1.5">
      <Icon className={cn("w-3 h-3", color)} />
      <span className={cn("text-sm font-bold", color)}>{value}%</span>
      <span className="text-[8px] text-muted-foreground">{label}</span>
    </div>
  );
}
