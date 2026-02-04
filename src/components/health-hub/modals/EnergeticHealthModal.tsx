import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Battery, BatteryLow, BatteryMedium, BatteryFull, Sunrise, Sunset, X, Headphones } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface EnergeticHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const EnergeticHealthModal = ({ isOpen, onClose, language }: EnergeticHealthModalProps) => {
  const { healthData } = useHealthData();
  const navigate = useNavigate();
  const isHebrew = language === 'he';

  const getEnergyIcon = () => {
    switch (healthData.energyLevel) {
      case 'high': return BatteryFull;
      case 'medium': return BatteryMedium;
      case 'low': return BatteryLow;
      default: return Battery;
    }
  };

  const EnergyIcon = getEnergyIcon();

  const handleStartHypnosis = (goal: string) => {
    onClose();
    navigate(`/hypnosis?goal=${goal}`);
  };

  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

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
            <Zap className="h-5 w-5" />
            {isHebrew ? 'בריאות אנרגטית' : 'Energy Health'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Energy Level */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {isHebrew ? 'רמת אנרגיה' : 'Energy Level'}
                    </p>
                    <p className="text-lg font-semibold text-amber-400">
                      {getEnergyLabel(healthData.energyLevel, isHebrew)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getEnergyColor(healthData.energyLevel)}`}>
                    <EnergyIcon className="h-6 w-6" />
                  </div>
                </div>
                <Progress 
                  value={getEnergyProgress(healthData.energyLevel)} 
                  className="h-2 mt-3"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Time-Based Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background/60 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {timeOfDay === 'morning' ? (
                    <Sunrise className="h-4 w-4 text-orange-400" />
                  ) : (
                    <Sunset className="h-4 w-4 text-purple-400" />
                  )}
                  <span className="text-sm font-medium">
                    {isHebrew 
                      ? `המלצות ל${timeOfDay === 'morning' ? 'בוקר' : timeOfDay === 'afternoon' ? 'צהריים' : 'ערב'}`
                      : `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Recommendations`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTimeBasedRecommendation(timeOfDay, healthData.energyLevel, isHebrew)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Energy Boosting Options */}
          <div className="grid grid-cols-1 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="bg-background/60 border-border/50 cursor-pointer hover:border-red-500/50 transition-colors"
                onClick={() => handleStartHypnosis('energy')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Headphones className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{isHebrew ? 'היפנוזה לאנרגיה' : 'Energy Hypnosis'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew ? 'הגבר את רמות האנרגיה שלך' : 'Boost your energy levels'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="bg-background/60 border-border/50 cursor-pointer hover:border-red-500/50 transition-colors"
                onClick={() => handleStartHypnosis('vitality')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Zap className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{isHebrew ? 'חיזוק חיוניות' : 'Vitality Boost'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew ? 'התחדשות מלאה של האנרגיה' : 'Full energy renewal'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Streak Info */}
          {healthData.healthStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-red-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">🔥 {healthData.healthStreak}</p>
                  <p className="text-xs text-muted-foreground">
                    {isHebrew ? 'ימים רצופים של פעילות בריאותית' : 'consecutive days of health activity'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getEnergyLabel(level: string | null, isHebrew: boolean): string {
  const labels: Record<string, { he: string; en: string }> = {
    high: { he: 'גבוהה', en: 'High' },
    medium: { he: 'בינונית', en: 'Medium' },
    low: { he: 'נמוכה', en: 'Low' },
    varies: { he: 'משתנה', en: 'Variable' },
  };
  return labels[level || '']?.[isHebrew ? 'he' : 'en'] || (isHebrew ? 'לא צוין' : 'Not specified');
}

function getEnergyColor(level: string | null): string {
  switch (level) {
    case 'high': return 'bg-green-500/20 text-green-500';
    case 'medium': return 'bg-amber-500/20 text-amber-500';
    case 'low': return 'bg-red-500/20 text-red-500';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getEnergyProgress(level: string | null): number {
  switch (level) {
    case 'high': return 100;
    case 'medium': return 60;
    case 'low': return 30;
    case 'varies': return 50;
    default: return 0;
  }
}

function getTimeBasedRecommendation(timeOfDay: string, energyLevel: string | null, isHebrew: boolean): string {
  if (timeOfDay === 'morning') {
    if (energyLevel === 'low') {
      return isHebrew 
        ? 'מומלץ להתחיל את היום עם היפנוזת אנרגיה קצרה כדי להתניע את הגוף והנפש'
        : 'Start your day with a short energy hypnosis to activate body and mind';
    }
    return isHebrew 
      ? 'זמן מצוין להגדיר כוונות ליום ולתכנן את הפעילות הבריאותית'
      : 'Great time to set intentions and plan your health activities';
  }
  
  if (timeOfDay === 'afternoon') {
    return isHebrew 
      ? 'אם מרגיש ירידה באנרגיה, נסה הפסקה קצרה עם נשימות עמוקות'
      : 'If feeling an energy dip, try a short break with deep breathing';
  }
  
  return isHebrew 
    ? 'זמן מצוין להירגע ולהתכונן לשינה איכותית'
    : 'Great time to unwind and prepare for quality sleep';
}

export default EnergeticHealthModal;
