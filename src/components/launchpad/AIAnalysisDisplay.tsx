import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, User, Briefcase, RefreshCw, Sparkles, Target, AlertTriangle, TrendingUp, Compass, Rocket, Shield, Heart, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';


interface AIAnalysisDisplayProps {
  language: string;
  refreshKey?: number;
}

interface SummaryData {
  consciousness_analysis?: {
    current_state?: string;
    dominant_patterns?: string[];
    strengths?: string[];
    blind_spots?: string[];
    growth_edges?: string[];
  };
  life_direction?: {
    core_aspiration?: string;
    clarity_score?: number;
    vision_summary?: string;
  };
  identity_profile?: {
    suggested_ego_state?: string;
    dominant_traits?: string[];
    values_hierarchy?: string[];
  };
  behavioral_insights?: {
    habits_to_transform?: string[];
    habits_to_cultivate?: string[];
    resistance_patterns?: string[];
  };
  career_path?: {
    current_status?: string;
    aspiration?: string;
    key_steps?: string[];
  };
  transformation_potential?: {
    readiness_score?: number;
    primary_focus?: string;
    secondary_focus?: string;
  };
}

const EGO_STATE_ICONS: Record<string, string> = {
  warrior: '⚔️',
  guardian: '🛡️',
  creator: '🎨',
  seeker: '🔍',
  sage: '🧙',
};

const EGO_STATE_LABELS: Record<string, { en: string; he: string }> = {
  warrior: { en: 'Warrior', he: 'לוחם' },
  guardian: { en: 'Guardian', he: 'שומר' },
  creator: { en: 'Creator', he: 'יוצר' },
  seeker: { en: 'Seeker', he: 'מחפש' },
  sage: { en: 'Sage', he: 'חכם' },
};

export function AIAnalysisDisplay({ language, refreshKey }: AIAnalysisDisplayProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [scores, setScores] = useState({
    consciousness: 0,
    clarity: 0,
    readiness: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('launchpad_summaries')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching summary:', error);
        } else if (data) {
          setSummary(data.summary_data as SummaryData);
          setScores({
            consciousness: data.consciousness_score || 0,
            clarity: data.clarity_score || 0,
            readiness: data.transformation_readiness || 0,
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [user?.id, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12 space-y-4">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground">
          {language === 'he' 
            ? 'אין ניתוח AI עדיין. לחץ על "חשב מחדש" ליצירת ניתוח.'
            : 'No AI analysis yet. Click "Regenerate" to create analysis.'
          }
        </p>
      </div>
    );
  }

  const isHebrew = language === 'he';

  // Get ego state info
  const egoState = summary.identity_profile?.suggested_ego_state?.toLowerCase() || '';
  const egoIcon = EGO_STATE_ICONS[egoState] || '🛡️';
  const egoLabel = EGO_STATE_LABELS[egoState];

  return (
    <div className="space-y-0">
      {/* Scores row */}
      <div className="flex items-center justify-around py-4 mb-3 rounded-2xl bg-muted/30">
        <ScoreCircle label={isHebrew ? 'תודעה' : 'Mind'} value={scores.consciousness} color="purple" />
        <ScoreCircle label={isHebrew ? 'בהירות' : 'Clarity'} value={scores.clarity} color="blue" />
        <ScoreCircle label={isHebrew ? 'מוכנות' : 'Ready'} value={scores.readiness} color="green" />
      </div>

      {/* Consciousness Analysis */}
      {summary.consciousness_analysis && (
        <div className="py-3 border-t border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <h4 className="text-sm font-semibold text-foreground">{isHebrew ? 'ניתוח תודעה' : 'Consciousness'}</h4>
          </div>
          {summary.consciousness_analysis.current_state && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{summary.consciousness_analysis.current_state}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {summary.consciousness_analysis.strengths && summary.consciousness_analysis.strengths.length > 0 && (
              <ChipRow icon="✨" label={isHebrew ? 'חוזקות' : 'Strengths'} items={summary.consciousness_analysis.strengths} variant="green" />
            )}
            {summary.consciousness_analysis.dominant_patterns && summary.consciousness_analysis.dominant_patterns.length > 0 && (
              <ChipRow icon="👁" label={isHebrew ? 'דפוסים' : 'Patterns'} items={summary.consciousness_analysis.dominant_patterns} variant="blue" />
            )}
            {summary.consciousness_analysis.blind_spots && summary.consciousness_analysis.blind_spots.length > 0 && (
              <ChipRow icon="⚠" label={isHebrew ? 'נקודות עיוורות' : 'Blind Spots'} items={summary.consciousness_analysis.blind_spots} variant="amber" />
            )}
            {summary.consciousness_analysis.growth_edges && summary.consciousness_analysis.growth_edges.length > 0 && (
              <ChipRow icon="📈" label={isHebrew ? 'צמיחה' : 'Growth'} items={summary.consciousness_analysis.growth_edges} variant="emerald" />
            )}
          </div>
        </div>
      )}

      {/* Identity Profile */}
      {summary.identity_profile && (
        <div className="py-3 border-t border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-rose-500" />
            <h4 className="text-sm font-semibold text-foreground">{isHebrew ? 'פרופיל זהות' : 'Identity'}</h4>
          </div>
          {summary.identity_profile.suggested_ego_state && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{egoIcon}</span>
              <span className="text-sm font-bold text-primary">
                {egoLabel ? (isHebrew ? egoLabel.he : egoLabel.en) : summary.identity_profile.suggested_ego_state}
              </span>
            </div>
          )}
          {summary.identity_profile.dominant_traits && summary.identity_profile.dominant_traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {summary.identity_profile.dominant_traits.slice(0, 5).map((t, i) => (
                <Badge key={i} variant="secondary" className="text-xs px-2.5 py-1">{t}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Behavioral Insights */}
      {summary.behavioral_insights && (
        <div className="py-3 border-t border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-4 w-4 text-cyan-500" />
            <h4 className="text-sm font-semibold text-foreground">{isHebrew ? 'תובנות התנהגותיות' : 'Behavioral Insights'}</h4>
          </div>
          <div className="space-y-2.5">
            {summary.behavioral_insights.habits_to_cultivate && summary.behavioral_insights.habits_to_cultivate.length > 0 && (
              <ChipRow icon="✅" label={isHebrew ? 'לטפח' : 'Cultivate'} items={summary.behavioral_insights.habits_to_cultivate} variant="green" />
            )}
            {summary.behavioral_insights.habits_to_transform && summary.behavioral_insights.habits_to_transform.length > 0 && (
              <ChipRow icon="🔄" label={isHebrew ? 'לשנות' : 'Transform'} items={summary.behavioral_insights.habits_to_transform} variant="amber" />
            )}
            {summary.behavioral_insights.resistance_patterns && summary.behavioral_insights.resistance_patterns.length > 0 && (
              <ChipRow icon="⚠" label={isHebrew ? 'התנגדויות' : 'Resistance'} items={summary.behavioral_insights.resistance_patterns} variant="red" />
            )}
          </div>
        </div>
      )}

      {/* Career + Transformation */}
      {(summary.career_path || summary.transformation_potential) && (
        <div className="py-3 border-t border-border/40">
          <div className="grid grid-cols-2 gap-4">
            {summary.career_path && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <h4 className="text-sm font-semibold text-foreground">{isHebrew ? 'קריירה' : 'Career'}</h4>
                </div>
                {summary.career_path.aspiration && (
                  <p className="text-sm text-foreground/80 mb-1.5">{summary.career_path.aspiration}</p>
                )}
                {summary.career_path.key_steps && summary.career_path.key_steps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {summary.career_path.key_steps.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {summary.transformation_potential && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-foreground">{isHebrew ? 'טרנספורמציה' : 'Transform'}</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.transformation_potential.primary_focus && (
                    <Badge className="text-xs px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">{summary.transformation_potential.primary_focus}</Badge>
                  )}
                  {summary.transformation_potential.secondary_focus && (
                    <Badge variant="outline" className="text-xs px-2.5 py-1 border-amber-500/30 text-amber-500">{summary.transformation_potential.secondary_focus}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

const CHIP_COLORS: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  red: 'bg-destructive/10 text-destructive',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

function ChipRow({ icon, label, items, variant }: { icon: string; label: string; items: string[]; variant: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 4).map((item, i) => (
          <span key={i} className={cn("text-xs font-medium px-2 py-0.5 rounded-full", CHIP_COLORS[variant] || CHIP_COLORS.blue)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreCircle({ label, value, color }: { label: string; value: number; color: string }) {
  const borderColors: Record<string, string> = {
    purple: 'border-purple-500', blue: 'border-blue-500', green: 'border-green-500',
  };
  const textColors: Record<string, string> = {
    purple: 'text-purple-500', blue: 'text-blue-500', green: 'text-green-500',
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 bg-background", borderColors[color], textColors[color])}>
        {value}
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
