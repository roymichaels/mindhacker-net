/**
 * SkillsPanel — MVP skills display component.
 * SSOT: Reads from user_skill_progress via useSkillsProgress hook.
 * Shows top 12 skills by level/XP with progress bars.
 * Clicking a skill opens SkillDetailModal (Phase 4).
 */
import { useState } from 'react';
import { useSkillsProgress, type SkillProgress } from '@/hooks/useSkillsProgress';
import { useTranslation } from '@/hooks/useTranslation';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkillDetailModal } from './SkillDetailModal';

interface SkillsPanelProps {
  compact?: boolean;
}

export function SkillsPanel({ compact = false }: SkillsPanelProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { topSkills, todayGains, totalTodayXP, isLoading } = useSkillsProgress();
  const [selectedSkill, setSelectedSkill] = useState<SkillProgress | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (topSkills.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {isHe ? 'השלם משימות כדי לפתח כישורים ✨' : 'Complete tasks to grow skills ✨'}
        </p>
      </div>
    );
  }

  const todayGainMap = new Map(todayGains.map(g => [g.skill_id, g.total]));

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            {isHe ? 'כישורים' : 'Skills'}
          </h3>
        </div>
        {totalTodayXP > 0 && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            +{totalTodayXP} {isHe ? 'היום' : 'today'}
          </span>
        )}
      </div>

      {/* Skills grid */}
      <div className={cn("p-3 grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
        {topSkills.map((sp) => {
          const xpInLevel = sp.xp_total % 100;
          const progressPct = Math.min(xpInLevel, 100);
          const todayGain = todayGainMap.get(sp.skill_id) || 0;
          const displayName = isHe ? (sp.skill.name_he || sp.skill.name) : sp.skill.name;

          return (
            <button
              key={sp.skill_id}
              onClick={() => setSelectedSkill(sp)}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/40 transition-colors text-start w-full"
            >
              <span className="text-lg shrink-0">{sp.skill.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-foreground truncate">{displayName}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground ml-1 shrink-0">
                    Lv.{sp.level}
                  </span>
                </div>
                <Progress value={progressPct} className="h-1.5" />
                {todayGain > 0 && (
                  <span className="text-[10px] text-primary mt-0.5 block">+{todayGain}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>

      <SkillDetailModal
        open={!!selectedSkill}
        onOpenChange={(v) => !v && setSelectedSkill(null)}
        skill={selectedSkill}
        todayGain={selectedSkill ? (todayGainMap.get(selectedSkill.skill_id) || 0) : 0}
        isHe={isHe}
      />
    </div>
  );
}

export default SkillsPanel;
