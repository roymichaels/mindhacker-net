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
    <div className="grid grid-cols-2 gap-2">
      {/* Scores */}
      <div className="col-span-2 flex items-center justify-center gap-6 py-3 rounded-xl border border-border/30 bg-card/30">
        <ScoreCircle label={isHebrew ? 'תודעה' : 'Mind'} value={scores.consciousness} color="purple" />
        <ScoreCircle label={isHebrew ? 'בהירות' : 'Clarity'} value={scores.clarity} color="blue" />
        <ScoreCircle label={isHebrew ? 'מוכנות' : 'Ready'} value={scores.readiness} color="green" />
      </div>

      {/* Consciousness Analysis */}
      {summary.consciousness_analysis && (
        <div className="col-span-2 p-3 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="h-3.5 w-3.5 text-purple-500" />
            <h4 className="text-xs font-semibold text-foreground">{isHebrew ? 'ניתוח תודעה' : 'Consciousness'}</h4>
          </div>
          {summary.consciousness_analysis.current_state && (
            <p className="text-[11px] text-muted-foreground line-clamp-3 mb-1.5">{summary.consciousness_analysis.current_state}</p>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            {summary.consciousness_analysis.strengths && summary.consciousness_analysis.strengths.length > 0 && (
              <ChipRow icon="✨" items={summary.consciousness_analysis.strengths} variant="green" />
            )}
            {summary.consciousness_analysis.dominant_patterns && summary.consciousness_analysis.dominant_patterns.length > 0 && (
              <ChipRow icon="👁" items={summary.consciousness_analysis.dominant_patterns} variant="blue" />
            )}
            {summary.consciousness_analysis.blind_spots && summary.consciousness_analysis.blind_spots.length > 0 && (
              <ChipRow icon="⚠" items={summary.consciousness_analysis.blind_spots} variant="amber" />
            )}
            {summary.consciousness_analysis.growth_edges && summary.consciousness_analysis.growth_edges.length > 0 && (
              <ChipRow icon="📈" items={summary.consciousness_analysis.growth_edges} variant="emerald" />
            )}
          </div>
        </div>
      )}

      {/* Identity Profile */}
      {summary.identity_profile && (
        <div className="p-3 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <User className="h-3.5 w-3.5 text-rose-500" />
            <h4 className="text-xs font-semibold text-foreground">{isHebrew ? 'פרופיל זהות' : 'Identity'}</h4>
          </div>
          {summary.identity_profile.suggested_ego_state && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-base">{egoIcon}</span>
              <span className="text-xs font-bold text-primary">
                {egoLabel ? (isHebrew ? egoLabel.he : egoLabel.en) : summary.identity_profile.suggested_ego_state}
              </span>
            </div>
          )}
          {summary.identity_profile.dominant_traits && summary.identity_profile.dominant_traits.length > 0 && (
            <ChipRow icon="🛡" items={summary.identity_profile.dominant_traits} variant="blue" />
          )}
        </div>
      )}

      {/* Behavioral Insights */}
      {summary.behavioral_insights && (
        <div className="p-3 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-cyan-500" />
            <h4 className="text-xs font-semibold text-foreground">{isHebrew ? 'תובנות' : 'Behavioral'}</h4>
          </div>
          {summary.behavioral_insights.habits_to_transform && summary.behavioral_insights.habits_to_transform.length > 0 && (
            <ChipRow icon="🚫" items={summary.behavioral_insights.habits_to_transform} variant="red" />
          )}
          {summary.behavioral_insights.habits_to_cultivate && summary.behavioral_insights.habits_to_cultivate.length > 0 && (
            <ChipRow icon="✅" items={summary.behavioral_insights.habits_to_cultivate} variant="green" />
          )}
          {summary.behavioral_insights.resistance_patterns && summary.behavioral_insights.resistance_patterns.length > 0 && (
            <ChipRow icon="⚠" items={summary.behavioral_insights.resistance_patterns} variant="amber" />
          )}
        </div>
      )}

      {/* Career + Transformation */}
      {(summary.career_path || summary.transformation_potential) && (
        <div className="col-span-2 p-3 rounded-xl border border-border/30 bg-card/30">
          <div className="flex gap-4">
            {summary.career_path && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                  <h4 className="text-xs font-semibold text-foreground">{isHebrew ? 'קריירה' : 'Career'}</h4>
                </div>
                {summary.career_path.aspiration && (
                  <p className="text-[11px] font-medium text-foreground truncate">{summary.career_path.aspiration}</p>
                )}
                {summary.career_path.key_steps && summary.career_path.key_steps.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {summary.career_path.key_steps.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.5">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {summary.transformation_potential && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Rocket className="h-3.5 w-3.5 text-amber-500" />
                  <h4 className="text-xs font-semibold text-foreground">{isHebrew ? 'טרנספורמציה' : 'Transform'}</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {summary.transformation_potential.primary_focus && (
                    <Badge className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">{summary.transformation_potential.primary_focus}</Badge>
                  )}
                  {summary.transformation_potential.secondary_focus && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-amber-500/30 text-amber-500">{summary.transformation_potential.secondary_focus}</Badge>
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

function ChipRow({ icon, items, variant }: { icon: string; items: string[]; variant: string }) {
  return (
    <div className="mt-1">
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[10px]">{icon}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 4).map((item, i) => (
          <span key={i} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", CHIP_COLORS[variant] || CHIP_COLORS.blue)}>
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
    <div className="flex flex-col items-center gap-1">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-base font-bold border-2 bg-background", borderColors[color], textColors[color])}>
        {value}
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
