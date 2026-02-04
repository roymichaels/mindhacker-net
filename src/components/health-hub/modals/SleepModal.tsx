import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Moon, Clock, Star, CloudMoon, X, Headphones } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const SleepModal = ({ isOpen, onClose, language }: SleepModalProps) => {
  const { healthData } = useHealthData();
  const navigate = useNavigate();
  const isHebrew = language === 'he';

  const handleStartHypnosis = () => {
    onClose();
    navigate('/hypnosis?goal=sleep');
  };

  const sleepTips = [
    {
      id: 'routine',
      icon: Clock,
      labelHe: 'שמור על שעות קבועות',
      labelEn: 'Keep consistent hours',
      descHe: 'לכו לישון וקומו באותן שעות כל יום',
      descEn: 'Go to bed and wake up at the same time daily',
    },
    {
      id: 'screen',
      icon: Moon,
      labelHe: 'הימנע ממסכים',
      labelEn: 'Avoid screens',
      descHe: 'הפסק שימוש במסכים שעה לפני השינה',
      descEn: 'Stop using screens an hour before bed',
    },
    {
      id: 'environment',
      icon: CloudMoon,
      labelHe: 'סביבה נוחה',
      labelEn: 'Comfortable environment',
      descHe: 'חדר חשוך, שקט וקריר',
      descEn: 'Dark, quiet, and cool room',
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
            <Moon className="h-5 w-5" />
            {isHebrew ? 'שינה' : 'Sleep'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Sleep Quality Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-400/10 border-indigo-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {isHebrew ? 'איכות שינה' : 'Sleep Quality'}
                    </p>
                    <p className="text-lg font-semibold text-indigo-400">
                      {getSleepQualityLabel(healthData.sleepQuality, isHebrew)}
                    </p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= getSleepStars(healthData.sleepQuality)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Progress 
                  value={getSleepProgress(healthData.sleepQuality)} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Hypnosis for Sleep */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20 cursor-pointer hover:border-red-500/50 transition-colors"
              onClick={handleStartHypnosis}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <Headphones className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-400">
                      {isHebrew ? 'היפנוזה לשינה עמוקה' : 'Deep Sleep Hypnosis'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew 
                        ? 'סשן מותאם אישית להירדמות מהירה ושינה איכותית'
                        : 'Personalized session for faster sleep and quality rest'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sleep Tips */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'טיפים לשינה טובה יותר' : 'Tips for Better Sleep'}
            </h4>
            {sleepTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="bg-background/60 border-border/30">
                  <CardContent className="p-3 flex items-center gap-3">
                    <tip.icon className="h-4 w-4 text-indigo-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {isHebrew ? tip.labelHe : tip.labelEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isHebrew ? tip.descHe : tip.descEn}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getSleepQualityLabel(quality: string | null, isHebrew: boolean): string {
  const labels: Record<string, { he: string; en: string }> = {
    excellent: { he: 'מצוינת', en: 'Excellent' },
    good: { he: 'טובה', en: 'Good' },
    moderate: { he: 'בינונית', en: 'Moderate' },
    poor: { he: 'ירודה', en: 'Poor' },
  };
  return labels[quality || '']?.[isHebrew ? 'he' : 'en'] || (isHebrew ? 'לא צוין' : 'Not specified');
}

function getSleepStars(quality: string | null): number {
  switch (quality) {
    case 'excellent': return 5;
    case 'good': return 4;
    case 'moderate': return 3;
    case 'poor': return 2;
    default: return 0;
  }
}

function getSleepProgress(quality: string | null): number {
  switch (quality) {
    case 'excellent': return 100;
    case 'good': return 80;
    case 'moderate': return 50;
    case 'poor': return 25;
    default: return 0;
  }
}

export default SleepModal;
