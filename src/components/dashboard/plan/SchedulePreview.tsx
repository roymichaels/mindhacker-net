/**
 * SchedulePreview — Weekly schedule template preview for Plan Tab (Plus/Apex).
 * Shows the template blocks and compliance stats.
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useScheduleCommitment, useHasCommandSchedule, useDailyCompliance } from '@/hooks/useCommandSchedule';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Shield, Lock, TrendingUp } from 'lucide-react';
import { CommitmentFlow } from './CommitmentFlow';

const BLOCK_TYPE_LABELS: Record<string, { he: string; en: string }> = {
  wake: { he: 'השכמה', en: 'Wake' },
  focus: { he: 'פוקוס עמוק', en: 'Deep Focus' },
  work: { he: 'עבודה', en: 'Work' },
  training: { he: 'אימון', en: 'Training' },
  recovery: { he: 'התאוששות', en: 'Recovery' },
  play: { he: 'משחק', en: 'Play' },
  learning: { he: 'למידה', en: 'Learning' },
  admin: { he: 'ניהול', en: 'Admin' },
  reflection: { he: 'רפלקציה', en: 'Reflection' },
  shutdown: { he: 'כיבוי', en: 'Shutdown' },
  sleep: { he: 'שינה', en: 'Sleep' },
};

export function SchedulePreview() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const hasAccess = useHasCommandSchedule();
  const { data: commitment, isLoading } = useScheduleCommitment();
  const { data: compliance = 0 } = useDailyCompliance();

  if (!hasAccess || isLoading) return null;

  const template = commitment?.template;
  const isCommitted = commitment?.committed;

  // No template yet
  if (!template || !template.blocks || template.blocks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <Clock className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {isHe
              ? 'לו״ז הפקודה ייווצר אוטומטית כשהתוכנית שלך תיבנה מחדש'
              : 'Command Schedule will be generated when your plan is rebuilt'}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {isHe ? 'Plus / Apex בלבד' : 'Plus / Apex only'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">
            {isHe ? 'לו״ז פקודה' : 'Command Schedule'}
          </h3>
          {isCommitted && (
            <Badge variant="default" className="text-[10px] gap-1 px-1.5 py-0 h-4">
              <Lock className="w-2.5 h-2.5" />
              {isHe ? 'נעול' : 'Locked'}
            </Badge>
          )}
        </div>
        {isCommitted && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">{compliance}%</span>
          </div>
        )}
      </div>

      {/* Compliance bar (committed only) */}
      {isCommitted && <Progress value={compliance} className="h-1.5" />}

      {/* Template blocks preview */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/50">
          {template.blocks.map((block, idx) => {
            const labels = BLOCK_TYPE_LABELS[block.block_type] || { he: block.block_type, en: block.block_type };
            return (
              <div key={idx} className="flex items-center gap-3 px-3 py-2">
                <span className="text-xs font-mono text-muted-foreground w-[90px] text-end shrink-0">
                  {block.start_time}–{block.end_time}
                </span>
                <span className="text-sm font-medium flex-1">
                  {isHe ? block.title_he : block.title_en}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {isHe ? labels.he : labels.en}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Commitment flow */}
      {!isCommitted && commitment?.planId && (
        <CommitmentFlow planId={commitment.planId} />
      )}
    </div>
  );
}
