/**
 * EarnLaunchpadModal — Simplified milestone checklist for Earn onboarding.
 */
import { useState, useCallback } from 'react';
import {
  CheckCircle2, Loader2, Lock, X, Circle,
  BarChart3, Pickaxe, Link2, Shield, Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface EarnLaunchpadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MILESTONES = [
  { id: 'welcome', titleEn: 'Welcome to Earn', titleHe: 'ברוכים הבאים להרוויח', action: 'auto', rewardMos: 5 },
  { id: 'enable_data', titleEn: 'Enable Data Monetization', titleHe: 'הפעל מונטיזציה של נתונים', action: 'toggle_data', rewardMos: 50 },
  { id: 'enable_mining', titleEn: 'Activate Mining', titleHe: 'הפעל כרייה', action: 'toggle_mining', rewardMos: 25 },
  { id: 'first_mine', titleEn: 'Mine Your First MOS', titleHe: 'כרה את ה-MOS הראשון', action: 'auto', rewardMos: 10 },
  { id: 'enable_partners', titleEn: 'Join Partners', titleHe: 'הצטרף לשותפים', action: 'toggle_partners', rewardMos: 25 },
  { id: 'share_link', titleEn: 'Share Your Link', titleHe: 'שתף את הקישור', action: 'auto', rewardMos: 10 },
  { id: 'first_referral', titleEn: 'First Referral', titleHe: 'הפניה ראשונה', action: 'auto', rewardMos: 50 },
  { id: 'earn_100', titleEn: 'Earn 100 MOS', titleHe: 'הרוויח 100 MOS', action: 'auto', rewardMos: 25 },
  { id: 'week_streak', titleEn: '7-Day Streak', titleHe: 'רצף 7 ימים', action: 'auto', rewardMos: 50 },
  { id: 'launchpad_complete', titleEn: 'Earn Master', titleHe: 'מאסטר הרווחה', action: 'auto', rewardMos: 100 },
] as const;

export function EarnLaunchpadModal({ open, onOpenChange }: EarnLaunchpadModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [togglingField, setTogglingField] = useState<string | null>(null);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['earn-launchpad', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('earn_launchpad_progress').select('*').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: created, error: e2 } = await supabase
          .from('earn_launchpad_progress')
          .insert({ user_id: user.id, milestones_completed: ['welcome'] })
          .select().single();
        if (e2) throw e2;
        return created;
      }
      return data;
    },
    enabled: !!user?.id && open,
  });

  const completed: string[] = (progress?.milestones_completed as string[]) || [];
  const completedCount = completed.length;
  const pct = Math.round((completedCount / MILESTONES.length) * 100);

  const completeMilestone = useCallback(async (milestoneId: string) => {
    if (!user?.id || !progress || completed.includes(milestoneId)) return;
    const updated = [...completed, milestoneId];
    await supabase.from('earn_launchpad_progress').update({ milestones_completed: updated }).eq('user_id', user.id);
    const m = MILESTONES.find(x => x.id === milestoneId);
    if (m && m.rewardMos > 0) {
      await supabase.rpc('fm_post_transaction', {
        p_user_id: user.id, p_type: 'earn_bounty', p_amount: m.rewardMos,
        p_description: `Earn Launchpad: ${m.titleEn}`,
        p_idempotency_key: `earn_lp_${milestoneId}_${user.id}`,
      });
    }
    toast.success(`🎉 +${m?.rewardMos || 0} MOS!`);
    queryClient.invalidateQueries({ queryKey: ['earn-launchpad'] });
    queryClient.invalidateQueries({ queryKey: ['fm-wallet'] });
  }, [user?.id, progress, completed, queryClient]);

  const handleToggle = useCallback(async (field: 'data_enabled' | 'mining_enabled' | 'partners_enabled', milestoneId: string) => {
    if (!user?.id || !progress) return;
    setTogglingField(field);
    try {
      const newVal = !(progress as any)[field];
      await supabase.from('earn_launchpad_progress').update({ [field]: newVal }).eq('user_id', user.id);
      if (newVal && !completed.includes(milestoneId)) await completeMilestone(milestoneId);
      if (field === 'partners_enabled' && newVal) {
        const { data: ex } = await supabase.from('affiliates').select('id').eq('user_id', user.id).maybeSingle();
        if (!ex) await supabase.from('affiliates').insert({ user_id: user.id, affiliate_code: user.id.slice(0, 8) });
      }
      if (field === 'data_enabled' && newVal) {
        for (const dt of ['sleep_patterns', 'habit_trends', 'mood_signals', 'training_results']) {
          const { data: ex } = await supabase.from('fm_data_contributions')
            .select('id').eq('user_id', user.id).eq('data_type', dt).is('revoked_at', null).maybeSingle();
          if (!ex) await supabase.from('fm_data_contributions').insert({
            user_id: user.id, data_type: dt, days_shared: 90, reward_mos: 0,
            consent_hash: `consent_${user.id}_${dt}_${Date.now()}`, status: 'active',
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['earn-launchpad'] });
      toast.success(newVal ? (isHe ? 'הופעל ✓' : 'Enabled ✓') : (isHe ? 'כובה' : 'Disabled'));
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setTogglingField(null); }
  }, [user?.id, progress, completed, completeMilestone, isHe, queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-[90vw] max-h-[80vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <DialogTitle className="sr-only">{isHe ? 'לאנצ׳פד הרווחה' : 'Earn Launchpad'}</DialogTitle>
        <DialogDescription className="sr-only">{isHe ? 'מסלול הרווחה' : 'Earning roadmap'}</DialogDescription>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-foreground">{isHe ? 'לאנצ׳פד הרווחה' : 'Earn Launchpad'}</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{completedCount}/{MILESTONES.length}</span>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {/* Progress */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
            </div>

            {/* Milestone list */}
            <div className="space-y-0.5">
              {MILESTONES.map((m, i) => {
                const done = completed.includes(m.id);
                const prevDone = i === 0 || completed.includes(MILESTONES[i - 1].id);
                const locked = !done && !prevDone;

                return (
                  <div key={m.id} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    done ? "opacity-60" : locked ? "opacity-40" : "bg-card border border-border/30"
                  )}>
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : locked ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <span className={cn("text-xs flex-1", done ? "line-through text-muted-foreground" : "font-medium text-foreground")}>
                      {isHe ? m.titleHe : m.titleEn}
                    </span>
                    <span className="text-[9px] font-bold text-amber-500">+{m.rewardMos}</span>

                    {/* Inline toggle for actionable items */}
                    {!done && !locked && m.action === 'toggle_data' && (
                      <Switch checked={!!(progress as any)?.data_enabled} onCheckedChange={() => handleToggle('data_enabled', m.id)} disabled={!!togglingField} />
                    )}
                    {!done && !locked && m.action === 'toggle_mining' && (
                      <Switch checked={!!(progress as any)?.mining_enabled} onCheckedChange={() => handleToggle('mining_enabled', m.id)} disabled={!!togglingField} />
                    )}
                    {!done && !locked && m.action === 'toggle_partners' && (
                      <Switch checked={!!(progress as any)?.partners_enabled} onCheckedChange={() => handleToggle('partners_enabled', m.id)} disabled={!!togglingField} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
              <Shield className="w-3 h-3 text-muted-foreground shrink-0" />
              <p className="text-[9px] text-muted-foreground">
                {isHe ? 'כל הנתונים אנונימיים. ניתן לכבות בכל עת.' : 'All data is anonymous. Disable anytime.'}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
