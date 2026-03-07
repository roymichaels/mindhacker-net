/**
 * CharacterProfileModal — Unified RPG Character Sheet.
 * Replaces 4 separate modals (Identity, Direction, Insights, Skills/Traits)
 * with a single inspect panel: Header → Stat Wheel → 4 internal tabs.
 */
import { useState, useEffect } from 'react';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { createPortal } from 'react-dom';
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
// Tabs removed — profile content shown directly
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
  const isOwner = !userId;
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { profile } = useOrbProfile();
  const [traitsOpen, setTraitsOpen] = useState(false);

  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);
  const archetypeIcon = getArchetypeIcon(dominantArchetype);

  if (!open) return null;

  // If traits gallery is open, render it full-screen
  if (traitsOpen) {
    return createPortal(
      <div
        role="dialog"
        className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <button
          onClick={() => setTraitsOpen(false)}
          className="absolute top-4 start-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => { setTraitsOpen(false); onOpenChange(false); }}
          className="absolute top-4 end-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 overflow-y-auto pt-14 px-3 pb-24">
          <TraitsTab isHe={isHe} />
        </div>
      </div>
    , document.body);
  }

  return createPortal(
    <div
      role="dialog"
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, hsl(220 25% 6%) 0%, hsl(225 20% 10%) 40%, hsl(220 25% 6%) 100%)' }}
    >
      {/* Close button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 end-4 z-10 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        <X className="w-5 h-5 text-white/70" />
      </button>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* ═══════ HEADER: Royal Character Card ═══════ */}
        <div className="relative pt-10 pb-5 px-4 flex flex-col items-center text-center">
          {/* Background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20"
            style={{ background: profile.primaryColor || 'hsl(35 80% 50%)' }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] opacity-10 bg-amber-400" />

          {/* Orb with gold ring */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-full border border-amber-500/30" style={{ boxShadow: '0 0 20px hsla(35, 80%, 50%, 0.15)' }} />
            <PersonalizedOrb size={72} state="idle" />
          </div>

          {/* Identity title */}
          <div className="mt-4 space-y-1">
            {dashboard.identityTitle && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{dashboard.identityTitle.icon}</span>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {isHe ? dashboard.identityTitle.title : dashboard.identityTitle.titleEn}
                </h2>
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <span className="text-amber-400/80 text-sm">{archetypeIcon}</span>
              <span className="text-xs font-medium text-amber-400/60 uppercase tracking-[0.15em]">{archetypeName}</span>
            </div>
          </div>

          {/* Level + XP — premium bar */}
          <div className="w-full max-w-[280px] mt-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/20">
                <Star className="h-3 w-3 fill-amber-400" /> Lv.{xp.level}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(35 80% 50%), hsl(45 90% 55%))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xp.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] text-white/30 tabular-nums font-mono">{xp.current}/{xp.required}</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                <Zap className="h-3 w-3" /> {tokens.balance}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400">
                <Flame className="h-3 w-3" /> {streak.streak}{streak.isActiveToday ? ' ✓' : ''}
              </span>
              <button
                onClick={() => setTraitsOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {isHe ? 'תכונות' : 'Traits'}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════ PROFILE CONTENT ═══════ */}
        <div className="pb-24 px-4">
          <ProfileTab
            isHe={isHe}
            language={language}
            dashboard={dashboard}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  , document.body);
}

// ═══════════════════════════════════════════════
// EMPIRE CARD — reusable prestige card wrapper
// ═══════════════════════════════════════════════
function EmpireCard({ children, className, glow }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] p-4",
        "bg-gradient-to-br from-white/[0.04] to-white/[0.01]",
        "backdrop-blur-sm",
        className,
      )}
      style={glow ? { boxShadow: `0 0 30px ${glow}, inset 0 1px 0 rgba(255,255,255,0.04)` } : { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, accentColor }: { icon: React.ReactNode; title: string; accentColor?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <div className={cn("p-1.5 rounded-lg", accentColor || "bg-amber-500/10")} >
        {icon}
      </div>
      <h4 className="text-sm font-bold text-white/90 tracking-wide">{title}</h4>
    </div>
  );
}

function EmpireBadge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'gold' | 'glass' }) {
  const styles = {
    default: 'bg-white/[0.06] text-white/70 border-white/[0.08]',
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    glass: 'bg-white/[0.04] text-white/50 border-white/[0.06]',
  };
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-lg border inline-block", styles[variant])}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════
// STAT WHEEL — gold-ringed diagnostic circles
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
          .select('summary_data, consciousness_score, clarity_score, transformation_readiness')
          .eq('user_id', user!.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          const sd = (data.summary_data as any) || {};
          const diag = sd.diagnostics || sd.diagnostic_scores || {};
          setScores([
            { key: 'energy', score: diag.energy_stability?.score ?? 0, color: '45 95% 55%' },
            { key: 'recovery', score: diag.recovery_debt?.score ?? 0, color: '0 85% 55%' },
            { key: 'dopamine', score: diag.dopamine_load?.score ?? 0, color: '270 70% 55%' },
            { key: 'execution', score: diag.execution_reliability?.score ?? 0, color: '150 70% 45%' },
            { key: 'time', score: diag.time_leverage?.score ?? 0, color: '210 100% 50%' },
            { key: 'consciousness', score: data.consciousness_score ?? 0, color: '168 70% 55%' },
            { key: 'clarity', score: data.clarity_score ?? 0, color: '210 80% 55%' },
            { key: 'readiness', score: data.transformation_readiness ?? 0, color: '150 60% 50%' },
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
    consciousness: { he: 'תודעה', en: 'Mind' },
    clarity: { he: 'בהירות', en: 'Clarity' },
    readiness: { he: 'מוכנות', en: 'Ready' },
  };

  if (scores.length === 0) return null;

  return (
    <EmpireCard className="mb-3">
      <div className="grid grid-cols-4 gap-3">
        {scores.map((s, i) => (
          <motion.div
            key={s.key}
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2"
              style={{
                borderColor: `hsl(${s.color})`,
                color: `hsl(${s.color})`,
                background: `radial-gradient(circle, hsla(${s.color}, 0.08) 0%, transparent 70%)`,
                boxShadow: `0 0 12px hsla(${s.color}, 0.15)`,
              }}
            >
              {s.score}
            </div>
            <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider text-center">
              {isHe ? labels[s.key]?.he : labels[s.key]?.en}
            </span>
          </motion.div>
        ))}
      </div>
    </EmpireCard>
  );
}

// ═══════════════════════════════════════════════
// PROFILE TAB — Empire-style categorized sections
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
    async function fetchData() {
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
    fetchData();
  }, [user]);

  const { lifeDirection, activeCommitments: commitments, dailyAnchors: anchors } = dashboard;

  return (
    <div className="space-y-3">
      {/* Stat Wheel */}
      <StatWheel isHe={isHe} />

      {/* ── KINGDOM: Life Direction ── */}
      {lifeDirection && (
        <EmpireCard glow="hsla(35, 80%, 50%, 0.06)" className="text-center">
          <SectionTitle
            icon={<Compass className="w-4 h-4 text-amber-400" />}
            title={isHe ? 'כיוון חיים' : 'Life Direction'}
            accentColor="bg-amber-500/10"
          />
          <div className="flex gap-0.5 mb-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("w-3.5 h-3.5", i < Math.round(lifeDirection.clarityScore / 20) ? "fill-amber-400 text-amber-400" : "text-white/10")} />
            ))}
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{lifeDirection.content}</p>
        </EmpireCard>
      )}

      {/* ── IDENTITY + DISCIPLINES: 2-col row ── */}
      {((dashboard.values.length > 0 || dashboard.selfConcepts.length > 0) || (anchors.length > 0 || dashboard.principles.length > 0)) && (
        <div className="grid grid-cols-2 gap-3">
          {(dashboard.values.length > 0 || dashboard.selfConcepts.length > 0) && (
            <EmpireCard className="text-center">
              <SectionTitle
                icon={<UserCircle className="w-4 h-4 text-purple-400" />}
                title={isHe ? 'זהות וערכים' : 'Identity & Values'}
                accentColor="bg-purple-500/10"
              />
              {dashboard.values.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-1">{isHe ? 'ערכים' : 'Values'}</p>
                  <div className="flex flex-col items-center gap-1">
                    {dashboard.values.map((v, i) => (
                      <EmpireBadge key={i} variant="gold">{v}</EmpireBadge>
                    ))}
                  </div>
                </div>
              )}
              {dashboard.selfConcepts.length > 0 && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-1">{isHe ? 'תפיסות עצמיות' : 'Self Concepts'}</p>
                  <div className="flex flex-col items-center gap-1">
                    {dashboard.selfConcepts.map((s, i) => (
                      <EmpireBadge key={i} variant="glass">{s}</EmpireBadge>
                    ))}
                  </div>
                </div>
              )}
            </EmpireCard>
          )}
          {(anchors.length > 0 || dashboard.principles.length > 0) && (
            <EmpireCard className="text-center">
              <SectionTitle
                icon={<Activity className="w-4 h-4 text-cyan-400" />}
                title={isHe ? 'משמעת וסדר' : 'Disciplines & Order'}
                accentColor="bg-cyan-500/10"
              />
              {anchors.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-1">{isHe ? 'עוגנים יומיים' : 'Daily Anchors'}</p>
                  <div className="flex flex-col items-center gap-1">
                    {anchors.map((a) => (
                      <EmpireBadge key={a.id}>{a.title}</EmpireBadge>
                    ))}
                  </div>
                </div>
              )}
              {dashboard.principles.length > 0 && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-1">{isHe ? 'עקרונות' : 'Principles'}</p>
                  <div className="flex flex-col items-center gap-1">
                    {dashboard.principles.map((p, i) => (
                      <EmpireBadge key={i}>{p}</EmpireBadge>
                    ))}
                  </div>
                </div>
              )}
            </EmpireCard>
          )}
        </div>
      )}

      {/* ── MISSIONS: Commitments ── */}
      {commitments.length > 0 && (
        <EmpireCard glow="hsla(204, 88%, 53%, 0.05)" className="text-center">
          <SectionTitle
            icon={<Target className="w-4 h-4 text-primary" />}
            title={isHe ? 'מחויבויות' : 'Active Commitments'}
            accentColor="bg-primary/10"
          />
          <div className="space-y-2">
            {commitments.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-white/70 font-medium">{c.title}</p>
              </div>
            ))}
          </div>
        </EmpireCard>
      )}

      {/* ── Archetype traits ── */}
      {archetypeData && (
        <EmpireCard>
          <TraitsCard archetypeData={archetypeData} />
        </EmpireCard>
      )}

      {/* ── AI Analysis ── */}
      {isOwner && <AIAnalysisDisplay language={language} />}
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



