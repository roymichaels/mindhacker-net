import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';
import { LifePlanExpanded } from './LifePlanExpanded';
import { ConsciousnessCard, BehavioralInsightsCard, IdentityProfileCard, TraitsCard, CommitmentsCard, DailyAnchorsDisplay } from './unified';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Compass, UserCircle, Heart, BarChart3, Flame, Zap, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        />
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="plan">{language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}</TabsTrigger>
            <TabsTrigger value="commitments">{language === 'he' ? 'מחויבות' : 'Commitments'}</TabsTrigger>
            <TabsTrigger value="anchors">{language === 'he' ? 'עוגנים' : 'Anchors'}</TabsTrigger>
          </TabsList>
          <TabsContent value="plan" className="mt-4">
            <LifePlanExpanded />
          </TabsContent>
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

// ===== INSIGHTS MODAL: AI Analysis + Consciousness + Stats =====
export function MergedInsightsModal({ open, onOpenChange, language }: ModalProps) {
  const dashboard = useUnifiedDashboard();
  const isRTL = language === 'he';

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
        />
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="ai">{language === 'he' ? 'ניתוח AI' : 'AI Analysis'}</TabsTrigger>
            <TabsTrigger value="consciousness">{language === 'he' ? 'תודעה' : 'Consciousness'}</TabsTrigger>
            <TabsTrigger value="stats">{language === 'he' ? 'סטטיסטיקה' : 'Stats'}</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-4">
            <AIAnalysisDisplay language={language} />
          </TabsContent>
          <TabsContent value="consciousness" className="mt-4">
            <ConsciousnessCard />
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
