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
    <div className="grid grid-cols-2 gap-1.5">
      {/* Scores — compact inline */}
      <div className="col-span-2 flex items-center justify-center gap-4 py-2 rounded-xl border border-border/30 bg-card/30">
        <ScoreCircle label={isHebrew ? 'תודעה' : 'Mind'} value={scores.consciousness} color="purple" />
        <ScoreCircle label={isHebrew ? 'בהירות' : 'Clarity'} value={scores.clarity} color="blue" />
        <ScoreCircle label={isHebrew ? 'מוכנות' : 'Ready'} value={scores.readiness} color="green" />
      </div>

      {/* Life Direction */}
      {summary.life_direction && (
        <div className="col-span-2 p-2 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1 mb-1">
            <Compass className="h-3 w-3 text-primary" />
            <h4 className="text-[10px] font-semibold text-foreground">{isHebrew ? 'כיוון החיים' : 'Life Direction'}</h4>
          </div>
          {summary.life_direction.core_aspiration && (
            <p className="text-[11px] font-medium text-foreground mb-0.5">{summary.life_direction.core_aspiration}</p>
          )}
          {summary.life_direction.vision_summary && (
            <p className="text-[10px] text-muted-foreground line-clamp-2">{summary.life_direction.vision_summary}</p>
          )}
          {summary.life_direction.clarity_score != null && summary.life_direction.clarity_score > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Progress value={summary.life_direction.clarity_score} className="flex-1 h-1" />
              <span className="text-[9px] font-medium tabular-nums">{summary.life_direction.clarity_score}%</span>
            </div>
          )}
        </div>
      )}

      {/* Consciousness Analysis */}
      {summary.consciousness_analysis && (
        <div className="p-2 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1 mb-1">
            <Brain className="h-3 w-3 text-purple-500" />
            <h4 className="text-[10px] font-semibold text-foreground">{isHebrew ? 'ניתוח תודעה' : 'Consciousness'}</h4>
          </div>
          {summary.consciousness_analysis.current_state && (
            <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">{summary.consciousness_analysis.current_state}</p>
          )}
          {summary.consciousness_analysis.strengths?.length > 0 && (
            <ChipRow icon="✨" items={summary.consciousness_analysis.strengths} variant="green" />
          )}
          {summary.consciousness_analysis.dominant_patterns?.length > 0 && (
            <ChipRow icon="👁" items={summary.consciousness_analysis.dominant_patterns} variant="blue" />
          )}
          {summary.consciousness_analysis.blind_spots?.length > 0 && (
            <ChipRow icon="⚠" items={summary.consciousness_analysis.blind_spots} variant="amber" />
          )}
          {summary.consciousness_analysis.growth_edges?.length > 0 && (
            <ChipRow icon="📈" items={summary.consciousness_analysis.growth_edges} variant="emerald" />
          )}
        </div>
      )}

      {/* Identity Profile */}
      {summary.identity_profile && (
        <div className="p-2 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1 mb-1">
            <User className="h-3 w-3 text-rose-500" />
            <h4 className="text-[10px] font-semibold text-foreground">{isHebrew ? 'פרופיל זהות' : 'Identity'}</h4>
          </div>
          {summary.identity_profile.suggested_ego_state && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">{egoIcon}</span>
              <span className="text-[11px] font-bold text-primary">
                {egoLabel ? (isHebrew ? egoLabel.he : egoLabel.en) : summary.identity_profile.suggested_ego_state}
              </span>
            </div>
          )}
          {summary.identity_profile.dominant_traits?.length > 0 && (
            <ChipRow icon="🛡" items={summary.identity_profile.dominant_traits} variant="blue" />
          )}
          {summary.identity_profile.values_hierarchy?.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {summary.identity_profile.values_hierarchy.map((v, i) => (
                <span key={i} className="text-[8px] text-rose-500">{v}{i < summary.identity_profile!.values_hierarchy!.length - 1 ? ' → ' : ''}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Behavioral Insights */}
      {summary.behavioral_insights && (
        <div className="p-2 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1 mb-1">
            <RefreshCw className="h-3 w-3 text-cyan-500" />
            <h4 className="text-[10px] font-semibold text-foreground">{isHebrew ? 'תובנות' : 'Behavioral'}</h4>
          </div>
          {summary.behavioral_insights.habits_to_transform?.length > 0 && (
            <ChipRow icon="🚫" items={summary.behavioral_insights.habits_to_transform} variant="red" />
          )}
          {summary.behavioral_insights.habits_to_cultivate?.length > 0 && (
            <ChipRow icon="✅" items={summary.behavioral_insights.habits_to_cultivate} variant="green" />
          )}
          {summary.behavioral_insights.resistance_patterns?.length > 0 && (
            <ChipRow icon="⚠" items={summary.behavioral_insights.resistance_patterns} variant="amber" />
          )}
        </div>
      )}

      {/* Career Path */}
      {summary.career_path && (
        <div className="p-2 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1 mb-1">
            <Briefcase className="h-3 w-3 text-blue-500" />
            <h4 className="text-[10px] font-semibold text-foreground">{isHebrew ? 'נתיב קריירה' : 'Career'}</h4>
          </div>
          {summary.career_path.current_status && (
            <p className="text-[10px] text-muted-foreground">{summary.career_path.current_status}</p>
          )}
          {summary.career_path.aspiration && (
            <p className="text-[10px] font-medium text-foreground mt-0.5">{summary.career_path.aspiration}</p>
          )}
          {summary.career_path.key_steps?.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {summary.career_path.key_steps.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[8px] px-1 py-0">{s}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transformation Potential */}
      {summary.transformation_potential && (
        <div className="col-span-2 p-2 rounded-xl border border-border/30 bg-card/30">
          <div className="flex items-center gap-1 mb-1">
            <Rocket className="h-3 w-3 text-amber-500" />
            <h4 className="text-[10px] font-semibold text-foreground">{isHebrew ? 'פוטנציאל טרנספורמציה' : 'Transformation'}</h4>
          </div>
          <div className="flex items-center gap-3">
            {summary.transformation_potential.primary_focus && (
              <Badge className="text-[8px] px-1.5 py-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">{summary.transformation_potential.primary_focus}</Badge>
            )}
            {summary.transformation_potential.secondary_focus && (
              <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-amber-500/30 text-amber-500">{summary.transformation_potential.secondary_focus}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compact helpers ──

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
      <div className="flex items-center gap-0.5 mb-0.5">
        <span className="text-[9px]">{icon}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {items.slice(0, 3).map((item, i) => (
          <span key={i} className={cn("text-[8px] font-medium px-1 py-0 rounded-full", CHIP_COLORS[variant] || CHIP_COLORS.blue)}>
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
    <div className="flex flex-col items-center gap-0.5">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 bg-background", borderColors[color], textColors[color])}>
        {value}
      </div>
      <span className="text-[8px] text-muted-foreground">{label}</span>
    </div>
  );
}
