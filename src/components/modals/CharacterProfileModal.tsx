/**
 * CharacterProfileModal — Unified RPG Character Sheet.
 * Replaces 4 separate modals (Identity, Direction, Insights, Skills/Traits)
 * with a single inspect panel: Header → Stat Wheel → 4 internal tabs.
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getArchetypeName, getArchetypeIcon } from '@/lib/orbProfileGenerator';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Star, Flame, Zap, X, UserCircle, Brain, Compass, Target,
  Heart, Activity, Clock, Trophy, BarChart3, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components reused from existing modals
import { IdentityProfileCard, CommitmentsCard, DailyAnchorsDisplay, ConsciousnessCard, BehavioralInsightsCard, TraitsCard } from '@/components/dashboard/unified';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';
import { useTraitGallery, PILLAR_COLORS, type TraitCard } from '@/hooks/useTraitGallery';
import { useTraitDetail } from '@/hooks/useTraitDetail';
import { getTraitDisplayName } from '@/utils/traitNameSanitizer';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ChevronLeft, Sparkles } from 'lucide-react';

interface CharacterProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string; // For community view — if provided, show public-only data
}

const PILLAR_LABELS_HE: Record<string, string> = {
  consciousness: 'תודעה', presence: 'נוכחות', power: 'כוח', vitality: 'חיוניות',
  focus: 'מיקוד', combat: 'לחימה', expansion: 'התרחבות', wealth: 'עושר',
  influence: 'השפעה', relationships: 'מערכות יחסים', business: 'עסקים',
  projects: 'פרויקטים', play: 'משחק', order: 'סדר',
};
const PILLAR_LABELS_EN: Record<string, string> = {
  consciousness: 'Consciousness', presence: 'Presence', power: 'Power', vitality: 'Vitality',
  focus: 'Focus', combat: 'Combat', expansion: 'Expansion', wealth: 'Wealth',
  influence: 'Influence', relationships: 'Relationships', business: 'Business',
  projects: 'Projects', play: 'Play', order: 'Order',
};

export function CharacterProfileModal({ open, onOpenChange, userId }: CharacterProfileModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const isOwner = !userId; // viewing own profile
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { profile } = useOrbProfile();

  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);
  const archetypeIcon = getArchetypeIcon(dominantArchetype);

  if (!open) return null;

  return (
    <div
      role="dialog"
      className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Close button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 end-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 overflow-y-auto">
        {/* ═══════ HEADER: Character Identity ═══════ */}
        <div className="relative pt-8 pb-4 px-4 flex flex-col items-center text-center">
          {/* Aura glow behind orb */}
          <div
            className="absolute top-6 w-28 h-28 rounded-full blur-3xl opacity-30"
            style={{ background: profile.primaryColor || 'hsl(var(--primary))' }}
          />
          <div className="relative">
            <PersonalizedOrb size={72} state="idle" />
          </div>

          {/* Identity title */}
          <div className="mt-3 space-y-1">
            {dashboard.identityTitle && (
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg">{dashboard.identityTitle.icon}</span>
                <h2 className="text-base font-bold text-foreground">
                  {isHe ? dashboard.identityTitle.title : dashboard.identityTitle.titleEn}
                </h2>
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span>{archetypeIcon}</span>
              <span className="font-medium">{archetypeName}</span>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
              <Star className="h-3 w-3" /> Lv.{xp.level}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Zap className="h-3 w-3" /> {tokens.balance}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              <Flame className="h-3 w-3" /> {streak.streak}
            </span>
          </div>

          {/* XP bar */}
          <div className="w-full max-w-xs mt-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>EXP {xp.current ?? 0} / {xp.required ?? 100}</span>
              <span>{xp.percentage}%</span>
            </div>
            <Progress value={xp.percentage} className="h-1.5 bg-muted/50" />
          </div>

          {/* Streak indicators */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className={cn(streak.isActiveToday ? 'text-primary font-bold' : '')}>
              {isHe ? 'היום' : 'Today'} {streak.isActiveToday ? '✓' : '○'}
            </span>
            <span>|</span>
            <span>{isHe ? 'שבוע' : 'Week'}: {streak.streak}🔥</span>
          </div>
        </div>

        {/* ═══════ STAT WHEEL ═══════ */}
        <StatWheel isHe={isHe} />

        {/* ═══════ TABS ═══════ */}
        <div className="px-3 pb-24">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-3">
              <TabsTrigger value="profile" className="text-xs gap-1">
                <UserCircle className="w-3.5 h-3.5" />
                {isHe ? 'פרופיל' : 'Profile'}
              </TabsTrigger>
              <TabsTrigger value="traits" className="text-xs gap-1">
                <Target className="w-3.5 h-3.5" />
                {isHe ? 'תכונות' : 'Traits'}
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs gap-1">
                <Brain className="w-3.5 h-3.5" />
                {isHe ? 'תובנות' : 'Insights'}
              </TabsTrigger>
            </TabsList>

            {/* ── Profile Tab (merged with Direction) ── */}
            <TabsContent value="profile">
              <ProfileTab
                isHe={isHe}
                language={language}
                dashboard={dashboard}
                isOwner={isOwner}
              />
            </TabsContent>

            {/* ── Traits Tab ── */}
            <TabsContent value="traits">
              <TraitsTab isHe={isHe} />
            </TabsContent>

            {/* ── Insights Tab ── */}
            <TabsContent value="insights">
              {isOwner ? (
                <InsightsTab isHe={isHe} language={language} dashboard={dashboard} />
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {isHe ? 'תובנות פרטיות' : 'Private insights'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// STAT WHEEL — compact row of pillar score circles
// ═══════════════════════════════════════════════
function StatWheel({ isHe }: { isHe: boolean }) {
  const { user } = useAuth();
  const [scores, setScores] = useState<Array<{ key: string; score: number; color: string }>>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      try {
        const { data } = await supabase
          .from('launchpad_summaries')
          .select('summary_data')
          .eq('user_id', user!.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.summary_data) {
          const sd = data.summary_data as any;
          const diag = sd.diagnostics || sd.diagnostic_scores || {};
          setScores([
            { key: 'energy', score: diag.energy_stability?.score ?? 0, color: '45 95% 55%' },
            { key: 'recovery', score: diag.recovery_debt?.score ?? 0, color: '0 85% 55%' },
            { key: 'dopamine', score: diag.dopamine_load?.score ?? 0, color: '270 70% 55%' },
            { key: 'execution', score: diag.execution_reliability?.score ?? 0, color: '150 70% 45%' },
            { key: 'time', score: diag.time_leverage?.score ?? 0, color: '210 100% 50%' },
          ]);
        }
      } catch {}
    }
    fetch();
  }, [user]);

  const labels: Record<string, { he: string; en: string }> = {
    energy: { he: 'אנרגיה', en: 'Energy' },
    recovery: { he: 'ריקברי', en: 'Recovery' },
    dopamine: { he: 'דופמין', en: 'Dopamine' },
    execution: { he: 'ביצוע', en: 'Execution' },
    time: { he: 'זמן', en: 'Time' },
  };

  if (scores.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3 border-y border-border/30">
      {scores.map((s) => (
        <div key={s.key} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
            style={{
              borderColor: `hsl(${s.color})`,
              color: `hsl(${s.color})`,
              backgroundColor: `hsla(${s.color}, 0.1)`,
            }}
          >
            {s.score}
          </div>
          <span className="text-[9px] text-muted-foreground font-medium">
            {isHe ? labels[s.key]?.he : labels[s.key]?.en}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// PROFILE TAB — Identity card + Values as chips
// ═══════════════════════════════════════════════
function ProfileTab({ isHe, language, dashboard, isOwner }: {
  isHe: boolean; language: string;
  dashboard: ReturnType<typeof useUnifiedDashboard>;
  isOwner: boolean;
}) {
  const { user } = useAuth();
  const [archetypeData, setArchetypeData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchArchetype() {
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
          if (sd.identity_profile?.archetype) {
            setArchetypeData(sd.identity_profile.archetype);
          }
        }
      } catch {}
    }
    fetchArchetype();
  }, [user]);

  return (
    <div className="space-y-4">
      {/* Values as chips */}
      {dashboard.values.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'ערכים' : 'Values'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dashboard.values.map((v, i) => (
              <Badge key={i} variant="secondary" className="text-xs px-2.5 py-0.5">
                {v}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Principles */}
      {dashboard.principles.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'עקרונות' : 'Principles'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dashboard.principles.map((p, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2.5 py-0.5">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Self concepts */}
      {dashboard.selfConcepts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'תפיסות עצמיות' : 'Self Concepts'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dashboard.selfConcepts.map((s, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2.5 py-0.5 bg-primary/5">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Archetype traits */}
      {archetypeData && <TraitsCard archetypeData={archetypeData} />}

      {/* Behavioral patterns (owner only) */}
      {isOwner && <BehavioralInsightsCard />}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TRAITS TAB — NFT-style trait gallery grid
// ═══════════════════════════════════════════════
function TraitsTab({ isHe }: { isHe: boolean }) {
  const { data: traits, isLoading } = useTraitGallery();
  const [selectedTraitId, setSelectedTraitId] = useState<string | null>(null);

  return (
    <AnimatePresence mode="wait">
      {selectedTraitId ? (
        <TraitDetailView
          key="detail"
          traitId={selectedTraitId}
          onBack={() => setSelectedTraitId(null)}
          isHe={isHe}
        />
      ) : (
        <motion.div
          key="gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (traits?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {isHe ? 'אין תכונות עדיין — צור תוכנית 100 יום' : 'No traits yet — generate your 100-day plan'}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {(traits || []).map((trait, i) => {
                const pillarColor = PILLAR_COLORS[trait.pillar] || '200 70% 50%';
                const displayName = isHe ? trait.displayName : getTraitDisplayName(trait.name, trait.name_he, false);
                const isUnlocked = trait.xp_total > 0 || trait.level > 1;
                return (
                  <motion.button
                    key={trait.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    onClick={() => setSelectedTraitId(trait.id)}
                    className={cn(
                      "relative aspect-square rounded-xl border p-2",
                      "flex flex-col items-center justify-center gap-1",
                      "transition-all duration-200 cursor-pointer group",
                      "hover:scale-[1.03] active:scale-[0.97]",
                      isUnlocked
                        ? "bg-card/60 backdrop-blur-sm border-border/40"
                        : "bg-muted/30 border-border/20 grayscale opacity-50",
                    )}
                    style={{
                      boxShadow: isUnlocked
                        ? `0 0 16px hsla(${pillarColor}, 0.12), inset 0 1px 0 hsla(${pillarColor}, 0.08)`
                        : 'none',
                    }}
                  >
                    <span className="text-2xl">{trait.icon}</span>
                    <span className={cn(
                      "text-[10px] font-bold text-center leading-tight line-clamp-2",
                      isUnlocked ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {displayName || (isHe ? 'תכונה' : 'Trait')}
                    </span>
                    <span
                      className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isUnlocked ? `hsla(${pillarColor}, 0.12)` : 'hsla(0, 0%, 50%, 0.1)',
                        color: isUnlocked ? `hsl(${pillarColor})` : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {isHe ? PILLAR_LABELS_HE[trait.pillar] : PILLAR_LABELS_EN[trait.pillar] || trait.pillar}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Trait detail drill-down (reused from SkillsModal)
function TraitDetailView({ traitId, onBack, isHe }: { traitId: string; onBack: () => void; isHe: boolean }) {
  const { data: detail, isLoading } = useTraitDetail(traitId);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  if (isLoading || !detail) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pillarColor = PILLAR_COLORS[detail.pillar] || '200 70% 50%';
  const displayName = isHe ? getTraitDisplayName(detail.name, detail.name_he, true) : getTraitDisplayName(detail.name, detail.name_he, false);
  const totalMilestones = detail.missions.reduce((s: number, m: any) => s + (m.milestones?.length || 0), 0);
  const completedMilestones = detail.missions.reduce((s: number, m: any) => s + (m.milestones?.filter((ms: any) => ms.is_completed)?.length || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="w-4 h-4" />
        {isHe ? 'חזרה' : 'Back'}
      </button>

      <div className="flex flex-col items-center text-center mb-5">
        <span className="text-4xl mb-2">{detail.icon}</span>
        <h3 className="text-base font-bold">{displayName}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `hsla(${pillarColor}, 0.15)`, color: `hsl(${pillarColor})` }}>
            {detail.missions.length} {isHe ? 'משימות' : 'missions'}
          </span>
          <span className="text-xs text-muted-foreground">{completedMilestones}/{totalMilestones} {isHe ? 'אבני דרך' : 'milestones'}</span>
        </div>
      </div>

      {detail.missions.map((mission) => {
        const missionTitle = isHe ? (mission.title || mission.title_en || '') : (mission.title_en || mission.title || '');
        const isExpanded = expandedMission === mission.id;
        const completedMs = mission.milestones.filter((m: any) => m.is_completed).length;
        return (
          <div key={mission.id} className="rounded-xl border border-border/30 overflow-hidden bg-card/30 mb-2">
            <button onClick={() => setExpandedMission(isExpanded ? null : mission.id)} className="w-full flex items-center gap-2 p-3 text-start hover:bg-muted/10 transition-colors">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium line-clamp-2">{missionTitle}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">{completedMs}/{mission.milestones.length} {isHe ? 'אבני דרך' : 'milestones'}</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-3 pb-3 space-y-1">
                    {mission.milestones.map((ms: any) => {
                      const msTitle = isHe ? (ms.title || ms.title_en || '') : (ms.title_en || ms.title || '');
                      return (
                        <div key={ms.id} className={cn("flex items-start gap-2 py-1.5 px-2 rounded-lg", ms.is_completed ? "bg-primary/5" : "bg-muted/10")}>
                          {ms.is_completed ? <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />}
                          <span className={cn("text-xs leading-snug", ms.is_completed ? "text-foreground/50 line-through" : "text-foreground/80")}>{msTitle}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// INSIGHTS TAB — AI Analysis + Consciousness + Diagnostics
// ═══════════════════════════════════════════════
function InsightsTab({ isHe, language, dashboard }: { isHe: boolean; language: string; dashboard: any }) {
  const { user } = useAuth();
  const [diagnosticScores, setDiagnosticScores] = useState<Array<{ key: string; label: string; labelEn: string; value: number; icon: typeof Zap; color: string; bgColor: string }>>([]);

  useEffect(() => {
    if (!user) return;
    async function fetchDiag() {
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
          setDiagnosticScores([
            { key: 'energy_stability', label: 'יציבות אנרגיה', labelEn: 'Energy Stability', value: diag.energy_stability?.score ?? 0, icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
            { key: 'recovery_debt', label: 'חוב ריקברי', labelEn: 'Recovery Debt', value: diag.recovery_debt?.score ?? 0, icon: Activity, color: 'text-red-500', bgColor: 'bg-red-500/10' },
            { key: 'dopamine_load', label: 'עומס דופמין', labelEn: 'Dopamine Load', value: diag.dopamine_load?.score ?? 0, icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
            { key: 'execution', label: 'אמינות ביצוע', labelEn: 'Execution', value: diag.execution_reliability?.score ?? 0, icon: Target, color: 'text-green-500', bgColor: 'bg-green-500/10' },
            { key: 'time', label: 'מינוף זמן', labelEn: 'Time Leverage', value: diag.time_leverage?.score ?? 0, icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          ]);
        }
      } catch {}
    }
    fetchDiag();
  }, [user]);

  const getScoreColor = (s: number) => s >= 75 ? 'text-green-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
  const getBarColor = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* Compact diagnostics */}
      {diagnosticScores.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{isHe ? 'אבחון' : 'Diagnostics'}</h4>
          {diagnosticScores.map((score) => {
            const Icon = score.icon;
            return (
              <div key={score.key} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/30">
                <div className={cn("p-1.5 rounded-md", score.bgColor)}>
                  <Icon className={cn("w-3.5 h-3.5", score.color)} />
                </div>
                <span className="text-xs font-medium flex-1">{isHe ? score.label : score.labelEn}</span>
                <span className={cn("text-sm font-bold tabular-nums", getScoreColor(score.value))}>{score.value}</span>
                <div className="w-16 h-1 rounded-full bg-muted/50 overflow-hidden">
                  <div className={cn("h-full rounded-full", getBarColor(score.value))} style={{ width: `${score.value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Consciousness card */}
      <ConsciousnessCard />

      {/* AI Analysis */}
      <AIAnalysisDisplay language={language} />

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: isHe ? 'רמה' : 'Level', value: dashboard.level, icon: Trophy, color: 'text-amber-500' },
          { label: isHe ? 'רצף' : 'Streak', value: dashboard.streak, icon: Flame, color: 'text-orange-500' },
          { label: isHe ? 'סשנים' : 'Sessions', value: dashboard.totalSessions, icon: Zap, color: 'text-blue-500' },
          { label: isHe ? 'טוקנים' : 'Tokens', value: dashboard.tokens, icon: BarChart3, color: 'text-emerald-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Icon className={cn("w-4 h-4", stat.color)} />
              <div>
                <p className="text-lg font-bold tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// DIRECTION TAB — Commitments + Anchors + Life direction as chips
// ═══════════════════════════════════════════════
function DirectionTab({ isHe, language, commitments, anchors, lifeDirection }: {
  isHe: boolean; language: string;
  commitments: Array<{ id: string; title: string; description: string | null }>;
  anchors: Array<{ id: string; title: string; category: string | null }>;
  lifeDirection: { content: string; clarityScore: number } | null;
}) {
  return (
    <div className="space-y-4">
      {/* Life direction */}
      {lifeDirection && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
            {isHe ? 'כיוון חיים' : 'Life Direction'}
          </h4>
          <p className="text-sm text-foreground leading-relaxed">{lifeDirection.content}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">{isHe ? 'בהירות' : 'Clarity'}:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("w-3 h-3", i < Math.round(lifeDirection.clarityScore / 20) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Commitments */}
      {commitments.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'מחויבויות' : 'Commitments'}
          </h4>
          <div className="space-y-1.5">
            {commitments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border/30">
                <Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily anchors */}
      {anchors.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'עוגנים יומיים' : 'Daily Anchors'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {anchors.map((a) => (
              <Badge key={a.id} variant="secondary" className="text-xs px-2.5 py-1">
                {a.title}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {commitments.length === 0 && anchors.length === 0 && !lifeDirection && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Compass className="w-8 h-8 mx-auto mb-2 opacity-30" />
          {isHe ? 'השלם את המסע לקבל כיוון' : 'Complete the journey to set direction'}
        </div>
      )}
    </div>
  );
}
