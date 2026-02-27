import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';
import { ConsciousnessCard, BehavioralInsightsCard, IdentityProfileCard, TraitsCard, CommitmentsCard, DailyAnchorsDisplay } from './unified';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Compass, UserCircle, Heart, BarChart3, Flame, Zap, Trophy, Activity, Target, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
}

// ===== IDENTITY MODAL: Identity Card + Traits + Patterns + Values =====
interface MergedIdentityModalProps extends ModalProps {
  values: string[];
  principles: string[];
  selfConcepts: string[];
  identityTitle?: { title: string; titleEn: string; icon: string } | null;
}

interface ArchetypeData {
  archetype: { name: string; nameEn: string; description: string; descriptionEn: string; icon: string };
  coreTraits: Array<{ name: string; nameEn: string; icon: string; reason: string; reasonEn: string }>;
  growthEdges: Array<{ area: string; areaEn: string }>;
  uniqueStrength: string;
  uniqueStrengthEn: string;
}

export function MergedIdentityModal({ open, onOpenChange, language, values, principles, selfConcepts, identityTitle }: MergedIdentityModalProps) {
  const { user } = useAuth();
  const [archetypeData, setArchetypeData] = useState<ArchetypeData | null>(null);
  const isRTL = language === 'he';

  useEffect(() => {
    if (!user || !open) return;
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
          } else if (sd.consciousness_analysis) {
            const ca = sd.consciousness_analysis;
            const ip = sd.identity_profile || {};
            setArchetypeData({
              archetype: { name: ip.suggested_ego_state || 'מעצב מודע', nameEn: ip.suggested_ego_state_en || 'Conscious Shaper', description: ca.current_state || '', descriptionEn: ca.current_state || '', icon: '🎯' },
              coreTraits: (ip.dominant_traits || ca.strengths || []).slice(0, 4).map((t: string, i: number) => ({ name: t, nameEn: t, icon: ['💡', '🔥', '⚡', '🌟'][i] || '✨', reason: '', reasonEn: '' })),
              growthEdges: (ca.growth_edges || []).slice(0, 3).map((e: string) => ({ area: e, areaEn: e })),
              uniqueStrength: ip.values_hierarchy?.[0] || ca.strengths?.[0] || '',
              uniqueStrengthEn: ip.values_hierarchy?.[0] || ca.strengths?.[0] || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching archetype:', err);
      }
    }
    fetchArchetype();
  }, [user, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader
          title={language === 'he' ? 'זהות' : 'Identity'}
          icon={<UserCircle className="h-5 w-5" />}
          showBackArrow={false}
        />
        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="identity">{language === 'he' ? 'זהות' : 'Identity'}</TabsTrigger>
            <TabsTrigger value="values">{language === 'he' ? 'ערכים' : 'Values'}</TabsTrigger>
            <TabsTrigger value="traits">{language === 'he' ? 'תכונות' : 'Traits'}</TabsTrigger>
            <TabsTrigger value="patterns">{language === 'he' ? 'דפוסים' : 'Patterns'}</TabsTrigger>
          </TabsList>
          <TabsContent value="identity" className="mt-4">
            <IdentityProfileCard values={values} principles={principles} selfConcepts={selfConcepts} identityTitle={identityTitle} showActions={false} />
          </TabsContent>
          <TabsContent value="values" className="mt-4">
            <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
              {values.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {language === 'he' ? 'הערכים שלי' : 'My Values'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {values.map((v, i) => (
                      <Badge key={i} className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm px-3 py-1">
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {principles.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {language === 'he' ? 'העקרונות שלי' : 'My Principles'}
                  </h4>
                  <ul className="space-y-2">
                    {principles.map((p, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {values.length === 0 && principles.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'he' ? 'השלם את המסע לגלות את הערכים שלך' : 'Complete the journey to discover your values'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="traits" className="mt-4">
            <TraitsCard archetypeData={archetypeData} />
          </TabsContent>
          <TabsContent value="patterns" className="mt-4">
            <BehavioralInsightsCard />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ===== DIRECTION MODAL: 90-Day Plan + Commitments + Anchors =====
interface MergedDirectionModalProps extends ModalProps {
  commitments: Array<{ id: string; title: string; description: string | null }>;
  anchors: Array<{ id: string; title: string; category: string | null }>;
}

export function MergedDirectionModal({ open, onOpenChange, language, commitments, anchors }: MergedDirectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader
          title={language === 'he' ? 'כיוון' : 'Direction'}
          icon={<Compass className="h-5 w-5" />}
          showBackArrow={false}
        />
        <Tabs defaultValue="commitments" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="commitments">{language === 'he' ? 'מחויבות' : 'Commitments'}</TabsTrigger>
            <TabsTrigger value="anchors">{language === 'he' ? 'עוגנים' : 'Anchors'}</TabsTrigger>
          </TabsList>
          <TabsContent value="commitments" className="mt-4">
            <CommitmentsCard commitments={commitments} />
          </TabsContent>
          <TabsContent value="anchors" className="mt-4">
            <DailyAnchorsDisplay anchors={anchors} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ===== INSIGHTS MODAL: AI Analysis + Consciousness + Diagnostics + Stats =====
interface MergedInsightsModalProps extends ModalProps {
  initialTab?: string;
}

export function MergedInsightsModal({ open, onOpenChange, language, initialTab }: MergedInsightsModalProps) {
  const dashboard = useUnifiedDashboard();
  const { user } = useAuth();
  const isRTL = language === 'he';
  const [diagnosticScores, setDiagnosticScores] = useState<Array<{
    key: string; label: string; labelEn: string; value: number;
    interpretation: string; interpretationEn: string;
    icon: typeof Zap; color: string; bgColor: string;
  }>>([]);
  const [diagLoading, setDiagLoading] = useState(false);

  // Determine which tab to show by default
  const defaultTab = initialTab === 'diagnostics' ? 'diagnostics' 
    : (initialTab && ['ai', 'consciousness', 'stats'].includes(initialTab)) ? initialTab 
    : 'ai';

  useEffect(() => {
    if (!user || !open) return;
    setDiagLoading(true);
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
            { key: 'energy_stability', label: 'יציבות אנרגיה', labelEn: 'Energy Stability', value: diag.energy_stability?.score ?? diag.nervous_system_score ?? 0, interpretation: diag.energy_stability?.interpretation || 'לא זמין', interpretationEn: diag.energy_stability?.interpretation_en || 'Not available', icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
            { key: 'recovery_debt', label: 'חוב ריקברי', labelEn: 'Recovery Debt', value: diag.recovery_debt?.score ?? diag.recovery_debt_score ?? 0, interpretation: diag.recovery_debt?.interpretation || 'לא זמין', interpretationEn: diag.recovery_debt?.interpretation_en || 'Not available', icon: Activity, color: 'text-red-500', bgColor: 'bg-red-500/10' },
            { key: 'dopamine_load', label: 'עומס דופמין', labelEn: 'Dopamine Load', value: diag.dopamine_load?.score ?? diag.dopamine_load_score ?? 0, interpretation: diag.dopamine_load?.interpretation || 'לא זמין', interpretationEn: diag.dopamine_load?.interpretation_en || 'Not available', icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
            { key: 'execution_reliability', label: 'אמינות ביצוע', labelEn: 'Execution Reliability', value: diag.execution_reliability?.score ?? diag.execution_reliability_score ?? 0, interpretation: diag.execution_reliability?.interpretation || 'לא זמין', interpretationEn: diag.execution_reliability?.interpretation_en || 'Not available', icon: Target, color: 'text-green-500', bgColor: 'bg-green-500/10' },
            { key: 'time_leverage', label: 'מינוף זמן', labelEn: 'Time Leverage', value: diag.time_leverage?.score ?? diag.time_optimization_score ?? 0, interpretation: diag.time_leverage?.interpretation || 'לא זמין', interpretationEn: diag.time_leverage?.interpretation_en || 'Not available', icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
            { key: 'hormonal_risk', label: 'סיכון הורמונלי', labelEn: 'Hormonal Risk', value: diag.hormonal_risk?.score ?? diag.hormonal_risk_score ?? 0, interpretation: diag.hormonal_risk?.interpretation || 'לא זמין', interpretationEn: diag.hormonal_risk?.interpretation_en || 'Not available', icon: Activity, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching diagnostics:', err);
      } finally {
        setDiagLoading(false);
      }
    }
    fetchDiag();
  }, [user, open]);

  const getScoreColor = (score: number) => score >= 75 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : score >= 25 ? 'text-orange-500' : 'text-red-500';
  const getBarColor = (score: number) => score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : score >= 25 ? 'bg-orange-500' : 'bg-red-500';

  const stats = [
    { label: language === 'he' ? 'רמה' : 'Level', value: dashboard.level, icon: Trophy, color: 'text-amber-500' },
    { label: language === 'he' ? 'רצף' : 'Streak', value: dashboard.streak, icon: Flame, color: 'text-orange-500' },
    { label: language === 'he' ? 'סשנים' : 'Sessions', value: dashboard.totalSessions, icon: Zap, color: 'text-blue-500' },
    { label: language === 'he' ? 'טוקנים' : 'Tokens', value: dashboard.tokens, icon: BarChart3, color: 'text-emerald-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader
          title={language === 'he' ? 'תובנות' : 'Insights'}
          icon={<Brain className="h-5 w-5" />}
          showBackArrow={false}
        />
        <Tabs defaultValue={defaultTab} key={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="ai">{language === 'he' ? 'ניתוח AI' : 'AI Analysis'}</TabsTrigger>
            <TabsTrigger value="consciousness">{language === 'he' ? 'תודעה' : 'Consciousness'}</TabsTrigger>
            <TabsTrigger value="diagnostics">{language === 'he' ? 'אבחון' : 'Diagnostics'}</TabsTrigger>
            <TabsTrigger value="stats">{language === 'he' ? 'סטטיסטיקה' : 'Stats'}</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-4">
            <AIAnalysisDisplay language={language} />
          </TabsContent>
          <TabsContent value="consciousness" className="mt-4">
            <ConsciousnessCard />
          </TabsContent>
          <TabsContent value="diagnostics" className="mt-4">
            {diagLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : diagnosticScores.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'השלם את המסע לקבל אבחון' : 'Complete the intake for diagnostics'}
                </p>
              </div>
            ) : (
              <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
                {diagnosticScores.map((score) => {
                  const Icon = score.icon;
                  return (
                    <div key={score.key} className="rounded-xl border border-border/50 p-4 space-y-2">
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
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", getBarColor(score.value))} style={{ width: `${score.value}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isRTL ? score.interpretation : score.interpretationEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/50">
                    <div className={`p-2.5 rounded-lg bg-background ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
