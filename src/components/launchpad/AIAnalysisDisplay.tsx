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
    <div className="space-y-6">
      {/* Consciousness Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Consciousness Score</p>
            <p className="text-3xl font-bold text-primary">{scores.consciousness}</p>
          </div>
        </CardContent>
      </Card>

      {/* Scores Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {isHebrew ? 'ציונים' : 'Scores'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <ScoreItem 
              label={isHebrew ? 'תודעה' : 'Consciousness'} 
              value={scores.consciousness} 
              color="bg-purple-500"
            />
            <ScoreItem 
              label={isHebrew ? 'בהירות' : 'Clarity'} 
              value={scores.clarity} 
              color="bg-blue-500"
            />
            <ScoreItem 
              label={isHebrew ? 'מוכנות' : 'Readiness'} 
              value={scores.readiness} 
              color="bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Life Direction - NEW! */}
      {summary.life_direction && (
        <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/10 border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Compass className="h-5 w-5 text-indigo-500" />
              {isHebrew ? 'כיוון החיים' : 'Life Direction'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.life_direction.core_aspiration && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'השאיפה המרכזית' : 'Core Aspiration'}
                </h4>
                <p className="text-base font-medium">{summary.life_direction.core_aspiration}</p>
              </div>
            )}
            {summary.life_direction.vision_summary && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'סיכום החזון' : 'Vision Summary'}
                </h4>
                <p className="text-sm leading-relaxed">{summary.life_direction.vision_summary}</p>
              </div>
            )}
            {summary.life_direction.clarity_score != null && summary.life_direction.clarity_score > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {isHebrew ? 'בהירות:' : 'Clarity:'}
                </span>
                <Progress value={summary.life_direction.clarity_score} className="flex-1 h-2" />
                <span className="text-sm font-medium">{summary.life_direction.clarity_score}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Consciousness Analysis */}
      {summary.consciousness_analysis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-500" />
              {isHebrew ? 'ניתוח מצב התודעה' : 'Consciousness Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.consciousness_analysis.current_state && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'מצב נוכחי' : 'Current State'}
                </h4>
                <p className="text-sm leading-relaxed">{summary.consciousness_analysis.current_state}</p>
              </div>
            )}
            
            {summary.consciousness_analysis.strengths && summary.consciousness_analysis.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  {isHebrew ? 'חוזקות' : 'Strengths'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.consciousness_analysis.strengths.map((strength, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.consciousness_analysis.dominant_patterns && summary.consciousness_analysis.dominant_patterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="h-4 w-4 text-blue-500" />
                  {isHebrew ? 'דפוסים דומיננטיים' : 'Dominant Patterns'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.consciousness_analysis.dominant_patterns.map((pattern, i) => (
                    <Badge key={i} variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.consciousness_analysis.growth_edges && summary.consciousness_analysis.growth_edges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  {isHebrew ? 'קצוות צמיחה' : 'Growth Edges'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.consciousness_analysis.growth_edges.map((edge, i) => (
                    <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {edge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.consciousness_analysis.blind_spots && summary.consciousness_analysis.blind_spots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {isHebrew ? 'נקודות עיוורון' : 'Blind Spots'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.consciousness_analysis.blind_spots.map((spot, i) => (
                    <Badge key={i} variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {spot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Identity Profile */}
      {summary.identity_profile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-rose-500" />
              {isHebrew ? 'פרופיל הזהות' : 'Identity Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.identity_profile.suggested_ego_state && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center">
                <div className="text-4xl mb-2">{egoIcon}</div>
                <div className="text-sm text-muted-foreground">
                  {isHebrew ? 'מצב אגו מומלץ' : 'Suggested Ego State'}
                </div>
                <div className="text-xl font-bold text-primary">
                  {egoLabel 
                    ? (isHebrew ? egoLabel.he : egoLabel.en)
                    : summary.identity_profile.suggested_ego_state
                  }
                </div>
              </div>
            )}

            {summary.identity_profile.dominant_traits && summary.identity_profile.dominant_traits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  {isHebrew ? 'תכונות דומיננטיות' : 'Dominant Traits'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.identity_profile.dominant_traits.map((trait, i) => (
                    <Badge key={i} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.identity_profile.values_hierarchy && summary.identity_profile.values_hierarchy.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Heart className="h-4 w-4 text-rose-500" />
                  {isHebrew ? 'היררכיית ערכים' : 'Values Hierarchy'}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {summary.identity_profile.values_hierarchy.map((value, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {value}
                      </Badge>
                      {i < summary.identity_profile!.values_hierarchy!.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Career Path */}
      {summary.career_path && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-blue-500" />
              {isHebrew ? 'נתיב קריירה' : 'Career Path'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.career_path.current_status && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {isHebrew ? 'סטטוס נוכחי' : 'Current Status'}
                </h4>
                <p className="text-sm">{summary.career_path.current_status}</p>
              </div>
            )}

            {summary.career_path.aspiration && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {isHebrew ? 'שאיפה' : 'Aspiration'}
                </h4>
                <p className="text-sm">{summary.career_path.aspiration}</p>
              </div>
            )}

            {summary.career_path.key_steps && summary.career_path.key_steps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'צעדים מרכזיים' : 'Key Steps'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.career_path.key_steps.map((step, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-500/5">
                      <Target className="h-3 w-3 me-1" />
                      {step}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Behavioral Insights */}
      {summary.behavioral_insights && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 text-cyan-500" />
              {isHebrew ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.behavioral_insights.habits_to_transform && summary.behavioral_insights.habits_to_transform.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  🚫 {isHebrew ? 'הרגלים לשנות' : 'Habits to Transform'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.behavioral_insights.habits_to_transform.map((habit, i) => (
                    <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive">
                      {habit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.behavioral_insights.habits_to_cultivate && summary.behavioral_insights.habits_to_cultivate.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  ✅ {isHebrew ? 'הרגלים לפתח' : 'Habits to Cultivate'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.behavioral_insights.habits_to_cultivate.map((habit, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                      {habit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.behavioral_insights.resistance_patterns && summary.behavioral_insights.resistance_patterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  ⚠️ {isHebrew ? 'דפוסי התנגדות' : 'Resistance Patterns'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.behavioral_insights.resistance_patterns.map((pattern, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-500/5 text-amber-600 dark:text-amber-400">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transformation Potential - NEW! */}
      {summary.transformation_potential && (
        <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/10 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5 text-amber-500" />
              {isHebrew ? 'פוטנציאל הטרנספורמציה' : 'Transformation Potential'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {summary.transformation_potential.primary_focus && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {isHebrew ? 'מיקוד עיקרי' : 'Primary Focus'}
                  </h4>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0">
                    {summary.transformation_potential.primary_focus}
                  </Badge>
                </div>
              )}
              {summary.transformation_potential.secondary_focus && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {isHebrew ? 'מיקוד משני' : 'Secondary Focus'}
                  </h4>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                    {summary.transformation_potential.secondary_focus}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="relative inline-flex items-center justify-center">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold",
          "bg-background border-4",
          color.replace('bg-', 'border-')
        )}>
          {value}
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
