/**
 * Earn page — 10-milestone Earn Launchpad roadmap.
 * Guides users through enabling data monetization, mining, and partners.
 * Route: /fm/earn
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins, CheckCircle2, Loader2, Circle, Lock,
  BarChart3, Pickaxe, Link2, UserPlus, Shield,
  Rocket, Star, Trophy, Zap, Gift, Target, TrendingUp, Eye,
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

interface EarnMilestone {
  id: string;
  index: number;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  icon: React.ReactNode;
  action: 'toggle_data' | 'toggle_mining' | 'toggle_partners' | 'navigate' | 'auto';
  actionTarget?: string;
  rewardMos: number;
}

const MILESTONES: EarnMilestone[] = [
  { id: 'welcome', index: 0, titleEn: 'Welcome to Earn', titleHe: 'ברוכים הבאים להרוויח', descEn: 'Open the Earn hub for the first time', descHe: 'פתח את מרכז ההרווחה בפעם הראשונה', icon: <Rocket className="w-5 h-5" />, action: 'auto', rewardMos: 5 },
  { id: 'enable_data', index: 1, titleEn: 'Enable Data Monetization', titleHe: 'הפעל מונטיזציה של נתונים', descEn: 'Allow anonymous data sharing to earn passively', descHe: 'אפשר שיתוף נתונים אנונימי כדי להרוויח פסיבית', icon: <BarChart3 className="w-5 h-5" />, action: 'toggle_data', rewardMos: 50 },
  { id: 'enable_mining', index: 2, titleEn: 'Activate Mining', titleHe: 'הפעל כרייה', descEn: 'Start mining MOS through daily activity', descHe: 'התחל לכרות MOS דרך פעילות יומית', icon: <Pickaxe className="w-5 h-5" />, action: 'toggle_mining', rewardMos: 25 },
  { id: 'first_mine', index: 3, titleEn: 'Mine Your First MOS', titleHe: 'כרה את ה-MOS הראשון שלך', descEn: 'Complete a daily activity to mine tokens', descHe: 'השלם פעילות יומית כדי לכרות טוקנים', icon: <Zap className="w-5 h-5" />, action: 'navigate', actionTarget: '/fm/earn', rewardMos: 10 },
  { id: 'enable_partners', index: 4, titleEn: 'Join Partners Program', titleHe: 'הצטרף לתוכנית שותפים', descEn: 'Get your referral link and start earning commissions', descHe: 'קבל קישור הפניה והתחל להרוויח עמלות', icon: <Link2 className="w-5 h-5" />, action: 'toggle_partners', rewardMos: 25 },
  { id: 'share_link', index: 5, titleEn: 'Share Your Link', titleHe: 'שתף את הקישור שלך', descEn: 'Copy and share your referral link', descHe: 'העתק ושתף את קישור ההפניה שלך', icon: <UserPlus className="w-5 h-5" />, action: 'navigate', actionTarget: '/fm/earn', rewardMos: 10 },
  { id: 'first_referral', index: 6, titleEn: 'Get Your First Referral', titleHe: 'קבל הפניה ראשונה', descEn: 'Someone signs up through your link', descHe: 'מישהו נרשם דרך הקישור שלך', icon: <Star className="w-5 h-5" />, action: 'auto', rewardMos: 50 },
  { id: 'earn_100', index: 7, titleEn: 'Earn 100 MOS', titleHe: 'הרוויח 100 MOS', descEn: 'Reach a total of 100 MOS earned', descHe: 'הגע לסכום כולל של 100 MOS שהרווחת', icon: <Target className="w-5 h-5" />, action: 'auto', rewardMos: 25 },
  { id: 'week_streak', index: 8, titleEn: '7-Day Mining Streak', titleHe: 'רצף כרייה של 7 ימים', descEn: 'Mine for 7 days in a row', descHe: 'כרה 7 ימים ברציפות', icon: <TrendingUp className="w-5 h-5" />, action: 'auto', rewardMos: 50 },
  { id: 'launchpad_complete', index: 9, titleEn: 'Earn Master', titleHe: 'מאסטר הרווחה', descEn: 'Complete all milestones and unlock full earning potential', descHe: 'השלם את כל אבני הדרך ושחרר פוטנציאל מלא', icon: <Trophy className="w-5 h-5" />, action: 'auto', rewardMos: 100 },
];

interface FMEarnProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  categoryFilter?: string;
  onCategoryChange?: (cat: string) => void;
}

export default function FMEarn({ activeTab, onTabChange, categoryFilter, onCategoryChange }: FMEarnProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [togglingField, setTogglingField] = useState<string | null>(null);

  // Fetch launchpad progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ['earn-launchpad', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('earn_launchpad_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;

      // Auto-create on first visit
      if (!data) {
        const { data: created, error: insertError } = await supabase
          .from('earn_launchpad_progress')
          .insert({ user_id: user.id, milestones_completed: ['welcome'] })
          .select()
          .single();
        if (insertError) throw insertError;
        return created;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const completedMilestones: string[] = (progress?.milestones_completed as string[]) || [];

  const completeMilestone = useCallback(async (milestoneId: string) => {
    if (!user?.id || !progress) return;
    if (completedMilestones.includes(milestoneId)) return;

    const updated = [...completedMilestones, milestoneId];
    const { error } = await supabase
      .from('earn_launchpad_progress')
      .update({ milestones_completed: updated })
      .eq('user_id', user.id);
    if (error) {
      toast.error(isHe ? 'שגיאה' : 'Error');
      return;
    }

    const milestone = MILESTONES.find(m => m.id === milestoneId);
    if (milestone && milestone.rewardMos > 0) {
      // Award MOS via fm_post_transaction
      await supabase.rpc('fm_post_transaction', {
        p_user_id: user.id,
        p_type: 'earn_bounty',
        p_amount: milestone.rewardMos,
        p_description: `Earn Launchpad: ${milestone.titleEn}`,
        p_idempotency_key: `earn_lp_${milestoneId}_${user.id}`,
      });
    }

    toast.success(
      isHe
        ? `🎉 +${milestone?.rewardMos || 0} MOS! ${milestone?.titleHe || ''}`
        : `🎉 +${milestone?.rewardMos || 0} MOS! ${milestone?.titleEn || ''}`
    );
    queryClient.invalidateQueries({ queryKey: ['earn-launchpad'] });
    queryClient.invalidateQueries({ queryKey: ['fm-wallet'] });
  }, [user?.id, progress, completedMilestones, isHe, queryClient]);

  const handleToggle = useCallback(async (field: 'data_enabled' | 'mining_enabled' | 'partners_enabled', milestoneId: string) => {
    if (!user?.id || !progress) return;
    setTogglingField(field);

    try {
      const newValue = !(progress as any)[field];
      const { error } = await supabase
        .from('earn_launchpad_progress')
        .update({ [field]: newValue })
        .eq('user_id', user.id);
      if (error) throw error;

      // If turning on and milestone not completed, complete it
      if (newValue && !completedMilestones.includes(milestoneId)) {
        await completeMilestone(milestoneId);
      }

      // If turning on partners, auto-create affiliate
      if (field === 'partners_enabled' && newValue) {
        const { data: existing } = await supabase.from('affiliates').select('id').eq('user_id', user.id).maybeSingle();
        if (!existing) {
          await supabase.from('affiliates').insert({
            user_id: user.id,
            affiliate_code: user.id.slice(0, 8),
          });
        }
      }

      // If turning on data, auto-create all data contributions
      if (field === 'data_enabled' && newValue) {
        const dataTypes = ['sleep_patterns', 'habit_trends', 'mood_signals', 'training_results'];
        for (const dt of dataTypes) {
          const { data: existing } = await supabase.from('fm_data_contributions')
            .select('id').eq('user_id', user.id).eq('data_type', dt).is('revoked_at', null).maybeSingle();
          if (!existing) {
            await supabase.from('fm_data_contributions').insert({
              user_id: user.id, data_type: dt, days_shared: 90, reward_mos: 0,
              consent_hash: `consent_${user.id}_${dt}_${Date.now()}`, status: 'active',
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['earn-launchpad'] });
      toast.success(
        newValue
          ? (isHe ? 'הופעל בהצלחה ✓' : 'Enabled ✓')
          : (isHe ? 'כובה' : 'Disabled')
      );
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setTogglingField(null);
    }
  }, [user?.id, progress, completedMilestones, completeMilestone, isHe, queryClient]);

  const completedCount = completedMilestones.length;
  const progressPercent = Math.round((completedCount / MILESTONES.length) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-black text-foreground flex items-center justify-center gap-2 tracking-tight">
          <Coins className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          {isHe ? 'הרוויח MOS' : 'Earn MOS'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isHe ? 'השלם את 10 אבני הדרך ושחרר את כל ערוצי ההרווחה' : 'Complete 10 milestones to unlock all earning channels'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            {isHe ? 'לאנצ׳פד הרווחה' : 'Earn Launchpad'}
          </span>
          <span className="text-xs font-bold text-primary">{completedCount}/{MILESTONES.length}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          {progressPercent === 100
            ? (isHe ? '🎉 הלאנצ׳פד הושלם! כל ערוצי ההרווחה פתוחים.' : '🎉 Launchpad complete! All earning channels unlocked.')
            : (isHe ? `${progressPercent}% הושלם — המשך להרוויח` : `${progressPercent}% complete — keep earning`)
          }
        </p>
      </div>

      {/* Toggle switches for active channels */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { field: 'data_enabled' as const, milestoneId: 'enable_data', labelEn: 'Data', labelHe: 'נתונים', icon: <BarChart3 className="w-4 h-4" />, color: 'text-emerald-500' },
          { field: 'mining_enabled' as const, milestoneId: 'enable_mining', labelEn: 'Mining', labelHe: 'כרייה', icon: <Pickaxe className="w-4 h-4" />, color: 'text-amber-500' },
          { field: 'partners_enabled' as const, milestoneId: 'enable_partners', labelEn: 'Partners', labelHe: 'שותפים', icon: <Link2 className="w-4 h-4" />, color: 'text-purple-500' },
        ]).map((ch) => {
          const enabled = progress ? (progress as any)[ch.field] : false;
          return (
            <div key={ch.field} className="bg-card border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold", ch.color)}>
                  {ch.icon}
                  {isHe ? ch.labelHe : ch.labelEn}
                </span>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => handleToggle(ch.field, ch.milestoneId)}
                  disabled={togglingField === ch.field}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {enabled ? (isHe ? 'פעיל' : 'Active') : (isHe ? 'כבוי' : 'Off')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Privacy notice */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground">
          {isHe
            ? 'כל הנתונים אנונימיים. אתה יכול לכבות בכל עת. MindOS לא מוכרת מידע אישי.'
            : 'All data is anonymous. You can disable anytime. MindOS never sells personal info.'}
        </p>
      </div>

      {/* Milestones Roadmap */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-foreground px-1 mb-3">
          {isHe ? 'מפת הדרכים' : 'Roadmap'}
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-[18px] top-4 bottom-4 w-0.5 bg-border" />

          <div className="space-y-0">
            {MILESTONES.map((milestone, i) => {
              const isCompleted = completedMilestones.includes(milestone.id);
              const prevCompleted = i === 0 || completedMilestones.includes(MILESTONES[i - 1].id);
              const isCurrent = !isCompleted && prevCompleted;
              const isLocked = !isCompleted && !isCurrent;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: isHe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "relative flex items-start gap-3 py-3 px-1 rounded-lg transition-all",
                    isCurrent && "bg-primary/5",
                    isLocked && "opacity-50",
                  )}
                >
                  {/* Node */}
                  <div className={cn(
                    "relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-background border-primary text-primary animate-pulse",
                    isLocked && "bg-muted border-border text-muted-foreground",
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      milestone.icon
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn(
                        "text-sm font-semibold",
                        isCompleted ? "text-muted-foreground line-through" : "text-foreground",
                      )}>
                        {isHe ? milestone.titleHe : milestone.titleEn}
                      </h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        isCompleted
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-500",
                      )}>
                        +{milestone.rewardMos} MOS
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isHe ? milestone.descHe : milestone.descEn}
                    </p>

                    {/* Action button for current milestone */}
                    {isCurrent && milestone.action === 'toggle_data' && (
                      <Button
                        size="sm"
                        className="mt-2 gap-1.5 text-xs"
                        onClick={() => handleToggle('data_enabled', milestone.id)}
                        disabled={!!togglingField}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        {isHe ? 'הפעל נתונים' : 'Enable Data'}
                      </Button>
                    )}
                    {isCurrent && milestone.action === 'toggle_mining' && (
                      <Button
                        size="sm"
                        className="mt-2 gap-1.5 text-xs"
                        onClick={() => handleToggle('mining_enabled', milestone.id)}
                        disabled={!!togglingField}
                      >
                        <Pickaxe className="w-3.5 h-3.5" />
                        {isHe ? 'הפעל כרייה' : 'Enable Mining'}
                      </Button>
                    )}
                    {isCurrent && milestone.action === 'toggle_partners' && (
                      <Button
                        size="sm"
                        className="mt-2 gap-1.5 text-xs"
                        onClick={() => handleToggle('partners_enabled', milestone.id)}
                        disabled={!!togglingField}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {isHe ? 'הצטרף לשותפים' : 'Join Partners'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
