/**
 * SkillDetailModal — Phase 4: Detailed view for a single skill.
 * Shows level, progress, today gain, top sources, job multiplier, next unlock.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2, Zap, TrendingUp, Lock } from 'lucide-react';
import type { SkillProgress } from '@/hooks/useSkillsProgress';

interface SkillDetailModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  skill: SkillProgress | null;
  todayGain: number;
  isHe: boolean;
}

export function SkillDetailModal({ open, onOpenChange, skill, todayGain, isHe }: SkillDetailModalProps) {
  const { user } = useAuth();

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['skill-sources', user?.id, skill?.skill_id],
    queryFn: async () => {
      if (!user?.id || !skill?.skill_id) return [];
      const { data, error } = await supabase.rpc('get_skill_sources', {
        p_user_id: user.id,
        p_skill_id: skill.skill_id,
        p_limit: 3,
      });
      if (error) throw error;
      return (data || []) as { label: string; total_xp: number; action_count: number; last_seen_at: string }[];
    },
    enabled: open && !!user?.id && !!skill?.skill_id,
  });

  const { data: multipliers } = useQuery({
    queryKey: ['job-skill-multipliers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc('get_job_skill_multipliers', { p_user_id: user.id });
      if (error) throw error;
      return (data || []) as { skill_id: string; multiplier: number }[];
    },
    enabled: open && !!user?.id,
  });

  const { data: unlocks } = useQuery({
    queryKey: ['skill-unlocks', skill?.skill_id],
    queryFn: async () => {
      if (!skill?.skill_id) return [];
      const { data, error } = await supabase
        .from('skill_unlocks')
        .select('*')
        .eq('skill_id', skill.skill_id)
        .order('level_required');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!skill?.skill_id,
  });

  if (!skill) return null;

  const xpInLevel = skill.xp_total % 100;
  const progressPct = Math.min(xpInLevel, 100);
  const displayName = isHe ? (skill.skill.name_he || skill.skill.name) : skill.skill.name;
  const jobMult = multipliers?.find((m) => m.skill_id === skill.skill_id)?.multiplier;
  const nextUnlock = unlocks?.find((u: any) => u.level_required > skill.level);
  const earnedUnlocks = unlocks?.filter((u: any) => u.level_required <= skill.level) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{skill.skill.icon}</span>
            <span>{displayName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Level + Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">Lv.{skill.level}</span>
              <span className="text-xs text-muted-foreground">{xpInLevel}/100 XP</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            {todayGain > 0 && (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> +{todayGain} {isHe ? 'היום' : 'today'}
              </p>
            )}
          </div>

          {/* Job multiplier */}
          {jobMult && jobMult > 1 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {isHe ? 'בונוס תפקיד' : 'Job bonus'}: ×{jobMult.toFixed(1)}
              </span>
            </div>
          )}

          {/* Sources */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              {isHe ? 'גדל מ...' : 'Grows from...'}
            </h4>
            {sourcesLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : sources && sources.length > 0 ? (
              <div className="space-y-1.5">
                {sources.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/30">
                    <span className="truncate flex-1 text-foreground">{s.label}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      +{s.total_xp} XP · {s.action_count}×
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isHe ? 'השלם משימות כדי לראות מקורות' : 'Complete tasks to see sources'}
              </p>
            )}
          </div>

          {/* Earned badges */}
          {earnedUnlocks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {isHe ? 'הישגים' : 'Earned'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {earnedUnlocks.map((u: any) => (
                  <span key={u.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {(u.reward_payload as any)?.badge_emoji} Lv.{u.level_required}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next unlock */}
          {nextUnlock && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {isHe ? 'הבא ברמה' : 'Next at Lv.'} {(nextUnlock as any).level_required}
                {' — '}
                {(nextUnlock as any).reward_payload?.badge_emoji} {isHe ? (nextUnlock as any).reward_label_he : (nextUnlock as any).reward_label}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
