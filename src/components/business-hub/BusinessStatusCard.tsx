import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Target, DollarSign, TrendingUp } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";

interface BusinessStatusCardProps {
  language: string;
}

const BusinessStatusCard = ({ language }: BusinessStatusCardProps) => {
  const { data: launchpadData, isLoading } = useLaunchpadData();

  // Extract business data from launchpad profile
  const profileData = launchpadData?.personalProfile || {};
  const focusAreas = launchpadData?.focusAreas || [];
  const welcomeQuiz = launchpadData?.welcomeQuiz || {};
  const firstWeek = launchpadData?.firstWeek || { habits_to_quit: [], habits_to_build: [], career_status: '', career_goal: '' };
  
  // Map focus areas to business labels
  const focusLabels: Record<string, { he: string; en: string }> = {
    money: { he: 'כסף', en: 'Money' },
    business: { he: 'עסקים', en: 'Business' },
    career: { he: 'קריירה', en: 'Career' },
  };

  // Get business-related focus areas
  const businessFocusAreas = focusAreas.filter(
    (area: string) => ['money', 'business', 'career'].includes(area)
  );

  // Extract status data
  const currentStatus = (profileData.occupation as string) || (profileData.currentRole as string) || firstWeek.career_status || '';
  
  // Get career goal from welcomeQuiz or firstWeek
  const businessSpecific = Array.isArray(welcomeQuiz.business_specific) ? welcomeQuiz.business_specific : [];
  const careerGoal = firstWeek.career_goal || (businessSpecific.length > 0 
    ? businessSpecific.map((k: string) => {
        const labels: Record<string, { he: string; en: string }> = {
          grow: { he: 'צמיחה עסקית', en: 'Business Growth' },
          marketing: { he: 'שיווק', en: 'Marketing' },
          sales: { he: 'מכירות', en: 'Sales' },
          leadership: { he: 'מנהיגות', en: 'Leadership' },
          earn_more: { he: 'להרוויח יותר', en: 'Earn more' },
        };
        return labels[k]?.[language === 'he' ? 'he' : 'en'] || k;
      }).join(', ')
    : '');

  const hasData = currentStatus || careerGoal || businessFocusAreas.length > 0;

  // Calculate a business readiness score based on available data
  const scores: number[] = [];
  if (currentStatus) scores.push(70);
  if (careerGoal) scores.push(80);
  if (businessFocusAreas.length > 0) scores.push(60 + businessFocusAreas.length * 10);
  
  const overallScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-950/80 border-amber-300/50 dark:border-amber-800/30 animate-pulse">
        <CardContent className="p-6 h-40" />
      </Card>
    );
  }

  const metrics = [
    {
      key: 'status',
      value: currentStatus,
      icon: Briefcase,
      labelHe: 'סטטוס נוכחי',
      labelEn: 'Current Status',
      displayValue: currentStatus,
      score: currentStatus ? 70 : 0,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'from-amber-500/30 to-yellow-400/20 dark:from-amber-500/20 dark:to-yellow-400/10',
    },
    {
      key: 'goals',
      value: careerGoal,
      icon: Target,
      labelHe: 'יעדים',
      labelEn: 'Goals',
      displayValue: careerGoal || (language === 'he' ? 'לא צוין' : 'Not set'),
      score: careerGoal ? 80 : 0,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'from-emerald-500/30 to-green-400/20 dark:from-emerald-500/20 dark:to-green-400/10',
    },
    {
      key: 'focus',
      value: businessFocusAreas.length > 0 ? 'set' : null,
      icon: DollarSign,
      labelHe: 'תחומי מיקוד',
      labelEn: 'Focus Areas',
      displayValue: businessFocusAreas.length > 0 
        ? businessFocusAreas.map((a: string) => focusLabels[a]?.[language === 'he' ? 'he' : 'en'] || a).join(', ')
        : (language === 'he' ? 'לא צוין' : 'Not set'),
      score: businessFocusAreas.length > 0 ? 60 + businessFocusAreas.length * 10 : 0,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'from-purple-500/30 to-violet-400/20 dark:from-purple-500/20 dark:to-violet-400/10',
    },
    {
      key: 'stage',
      value: hasData ? 'active' : null,
      icon: TrendingUp,
      labelHe: 'שלב עסקי',
      labelEn: 'Business Stage',
      displayValue: language === 'he' ? 'התחלה' : 'Starting',
      score: 50,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'from-cyan-500/30 to-blue-400/20 dark:from-cyan-500/20 dark:to-blue-400/10',
    },
  ].filter(m => m.value);

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-950/80 border-amber-300/50 dark:border-amber-800/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/30 dark:bg-amber-500/20 rounded-lg">
              <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-base text-amber-700 dark:text-amber-400">
              {language === 'he' ? 'סטטוס עסקי' : 'Business Status'}
            </CardTitle>
          </div>
          {hasData && overallScore > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${getScoreColor(overallScore)}`} />
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          )}
        </div>
        {hasData && overallScore > 0 && (
          <div className="mt-2">
            <Progress 
              value={overallScore} 
              className="h-1.5 bg-gray-200 dark:bg-gray-800"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((metric) => (
              <div 
                key={metric.key}
                className={`p-3 rounded-xl bg-gradient-to-br ${metric.bgColor} border border-black/5 dark:border-white/5 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? metric.labelHe : metric.labelEn}
                  </p>
                </div>
                <p className={`font-semibold text-sm ${metric.color} truncate`}>
                  {metric.displayValue}
                </p>
                <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(metric.score)} transition-all`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 dark:bg-amber-500/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-amber-500/60 dark:text-amber-400/50" />
            </div>
            <p className="text-muted-foreground mb-4">
              {language === 'he' 
                ? 'עדיין אין נתונים עסקיים - התחל את מסע העסקים שלך'
                : 'No business data yet - start your business journey'}
            </p>
            <Button asChild className="bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400">
              <Link to="/business/journey">
                {language === 'he' ? 'התחל את המסע' : 'Start your journey'}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessStatusCard;
