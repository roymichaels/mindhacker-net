import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Utensils, Moon, Droplets, TrendingUp, X, ArrowLeft } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { motion } from "framer-motion";

interface PhysicalHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const PhysicalHealthModal = ({ isOpen, onClose, language }: PhysicalHealthModalProps) => {
  const { healthData } = useHealthData();
  const isHebrew = language === 'he';

  const physicalMetrics = [
    {
      id: 'activity',
      icon: Activity,
      label: isHebrew ? 'פעילות גופנית' : 'Physical Activity',
      value: healthData.activityLevel,
      valueLabel: getActivityLabel(healthData.activityLevel, isHebrew),
      score: getActivityScore(healthData.activityLevel),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      id: 'nutrition',
      icon: Utensils,
      label: isHebrew ? 'תזונה' : 'Nutrition',
      value: null, // Future: connect to nutrition tracking
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'sleep',
      icon: Moon,
      label: isHebrew ? 'איכות שינה' : 'Sleep Quality',
      value: healthData.sleepQuality,
      valueLabel: getSleepLabel(healthData.sleepQuality, isHebrew),
      score: getSleepScore(healthData.sleepQuality),
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      id: 'hydration',
      icon: Droplets,
      label: isHebrew ? 'הידרציה' : 'Hydration',
      value: healthData.hydrationStatus,
      valueLabel: getHydrationLabel(healthData.hydrationStatus, isHebrew),
      score: getHydrationScore(healthData.hydrationStatus),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 border-red-800/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <Activity className="h-5 w-5" />
            {isHebrew ? 'בריאות פיזית' : 'Physical Health'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Overall Physical Score */}
          <Card className="bg-gradient-to-r from-red-500/10 to-rose-400/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {isHebrew ? 'ציון כללי' : 'Overall Score'}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-bold text-red-400">{healthData.healthScore}%</span>
                </div>
              </div>
              <Progress value={healthData.healthScore} className="h-2" />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {physicalMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${metric.bgColor} border-border/30 h-full`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <p className={`font-semibold ${metric.color}`}>
                      {metric.valueLabel}
                    </p>
                    {metric.score !== null && (
                      <Progress value={metric.score} className="h-1 mt-2" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recommendations */}
          {healthData.recommendations.length > 0 && (
            <Card className="bg-background/60 border-border/50">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-2">
                  {isHebrew ? 'המלצות לשיפור' : 'Improvement Recommendations'}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {healthData.recommendations.includes('increase_activity') && (
                    <li className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-orange-500" />
                      {isHebrew ? 'הגבר את הפעילות הגופנית' : 'Increase physical activity'}
                    </li>
                  )}
                  {healthData.recommendations.includes('improve_sleep') && (
                    <li className="flex items-center gap-2">
                      <Moon className="h-3 w-3 text-indigo-500" />
                      {isHebrew ? 'שפר את איכות השינה' : 'Improve sleep quality'}
                    </li>
                  )}
                  {healthData.recommendations.includes('hydrate_more') && (
                    <li className="flex items-center gap-2">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      {isHebrew ? 'שתה יותר מים' : 'Drink more water'}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getActivityLabel(level: string | null, isHebrew: boolean): string {
  const labels: Record<string, { he: string; en: string }> = {
    daily: { he: 'יומית', en: 'Daily' },
    weekly: { he: 'שבועית', en: 'Weekly' },
    rarely: { he: 'לעתים רחוקות', en: 'Rarely' },
    none: { he: 'לא פעיל', en: 'Not active' },
  };
  return labels[level || '']?.[isHebrew ? 'he' : 'en'] || (isHebrew ? 'לא צוין' : 'Not specified');
}

function getActivityScore(level: string | null): number {
  const scores: Record<string, number> = { daily: 100, weekly: 70, rarely: 35, none: 0 };
  return scores[level || ''] ?? 0;
}

function getSleepLabel(quality: string | null, isHebrew: boolean): string {
  const labels: Record<string, { he: string; en: string }> = {
    excellent: { he: 'מצוינת', en: 'Excellent' },
    good: { he: 'טובה', en: 'Good' },
    moderate: { he: 'בינונית', en: 'Moderate' },
    poor: { he: 'ירודה', en: 'Poor' },
  };
  return labels[quality || '']?.[isHebrew ? 'he' : 'en'] || (isHebrew ? 'לא צוין' : 'Not specified');
}

function getSleepScore(quality: string | null): number {
  const scores: Record<string, number> = { excellent: 100, good: 80, moderate: 50, poor: 25 };
  return scores[quality || ''] ?? 0;
}

function getHydrationLabel(status: string | null, isHebrew: boolean): string {
  const labels: Record<string, { he: string; en: string }> = {
    excellent: { he: 'מצוינת', en: 'Excellent' },
    good: { he: 'טובה', en: 'Good' },
    moderate: { he: 'בינונית', en: 'Moderate' },
    poor: { he: 'לא מספיקה', en: 'Insufficient' },
  };
  return labels[status || '']?.[isHebrew ? 'he' : 'en'] || (isHebrew ? 'לא צוין' : 'Not specified');
}

function getHydrationScore(status: string | null): number {
  const scores: Record<string, number> = { excellent: 100, good: 80, moderate: 50, poor: 25 };
  return scores[status || ''] ?? 0;
}

export default PhysicalHealthModal;
