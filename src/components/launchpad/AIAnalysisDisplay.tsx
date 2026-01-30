import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, User, Briefcase, RefreshCw, Sparkles, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AIAnalysisDisplayProps {
  language: string;
}

interface SummaryData {
  consciousness_analysis?: {
    current_state?: string;
    patterns?: string[];
    strengths?: string[];
    blind_spots?: string[];
  };
  identity_profile?: {
    ego_state?: string;
    core_traits?: string[];
    values_hierarchy?: string[];
  };
  behavioral_insights?: {
    habits_to_change?: string[];
    habits_to_develop?: string[];
    resistance_points?: string[];
  };
  career_path?: {
    current_status?: string;
    aspiration?: string;
    suggested_steps?: string[];
  };
}

export function AIAnalysisDisplay({ language }: AIAnalysisDisplayProps) {
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
  }, [user?.id]);

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

  return (
    <div className="space-y-6">
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
                <p className="text-sm">{summary.consciousness_analysis.current_state}</p>
              </div>
            )}
            
            {summary.consciousness_analysis.strengths && summary.consciousness_analysis.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
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

            {summary.consciousness_analysis.patterns && summary.consciousness_analysis.patterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'דפוסים' : 'Patterns'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.consciousness_analysis.patterns.map((pattern, i) => (
                    <Badge key={i} variant="outline">
                      {pattern}
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
            {summary.identity_profile.ego_state && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'מצב אגו' : 'Ego State'}
                </h4>
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-base px-4 py-1">
                  {summary.identity_profile.ego_state}
                </Badge>
              </div>
            )}

            {summary.identity_profile.core_traits && summary.identity_profile.core_traits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'תכונות ליבה' : 'Core Traits'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.identity_profile.core_traits.map((trait, i) => (
                    <Badge key={i} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.identity_profile.values_hierarchy && summary.identity_profile.values_hierarchy.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'היררכיית ערכים' : 'Values Hierarchy'}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {summary.identity_profile.values_hierarchy.map((value, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">
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

            {summary.career_path.suggested_steps && summary.career_path.suggested_steps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {isHebrew ? 'צעדים מומלצים' : 'Suggested Steps'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.career_path.suggested_steps.map((step, i) => (
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
            {summary.behavioral_insights.habits_to_change && summary.behavioral_insights.habits_to_change.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  🚫 {isHebrew ? 'הרגלים לשנות' : 'Habits to Change'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.behavioral_insights.habits_to_change.map((habit, i) => (
                    <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive">
                      {habit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.behavioral_insights.habits_to_develop && summary.behavioral_insights.habits_to_develop.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  ✅ {isHebrew ? 'הרגלים לפתח' : 'Habits to Develop'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.behavioral_insights.habits_to_develop.map((habit, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                      {habit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.behavioral_insights.resistance_points && summary.behavioral_insights.resistance_points.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  ⚠️ {isHebrew ? 'נקודות התנגדות' : 'Resistance Points'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.behavioral_insights.resistance_points.map((point, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-500/5 text-amber-600 dark:text-amber-400">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
