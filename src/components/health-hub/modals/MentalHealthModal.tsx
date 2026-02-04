import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Shield, Smile, Frown, Meh, X, Headphones } from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface MentalHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const MentalHealthModal = ({ isOpen, onClose, language }: MentalHealthModalProps) => {
  const { healthData } = useHealthData();
  const navigate = useNavigate();
  const isHebrew = language === 'he';

  const getStressIcon = () => {
    switch (healthData.stressLevel) {
      case 'low': return Smile;
      case 'moderate': return Meh;
      case 'high': return Frown;
      default: return Meh;
    }
  };

  const StressIcon = getStressIcon();

  const handleStartHypnosis = (goal: string) => {
    onClose();
    navigate(`/hypnosis?goal=${goal}`);
  };

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
            <Brain className="h-5 w-5" />
            {isHebrew ? 'בריאות נפשית' : 'Mental Health'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Stress Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-400/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {isHebrew ? 'רמת מתח' : 'Stress Level'}
                    </p>
                    <p className="text-lg font-semibold text-purple-400">
                      {getStressLabel(healthData.stressLevel, isHebrew)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getStressColor(healthData.stressLevel)}`}>
                    <StressIcon className="h-6 w-6" />
                  </div>
                </div>
                <Progress 
                  value={getStressProgress(healthData.stressLevel)} 
                  className="h-2 mt-3"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Mental Wellness Tools */}
          <div className="grid grid-cols-1 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className="bg-background/60 border-border/50 cursor-pointer hover:border-red-500/50 transition-colors"
                onClick={() => handleStartHypnosis('stress')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Headphones className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{isHebrew ? 'היפנוזה להפחתת מתח' : 'Stress Relief Hypnosis'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew ? 'סשן מותאם אישית להרפיה עמוקה' : 'Personalized deep relaxation session'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="bg-background/60 border-border/50 cursor-pointer hover:border-red-500/50 transition-colors"
                onClick={() => handleStartHypnosis('confidence')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{isHebrew ? 'חיזוק חוסן נפשי' : 'Build Mental Resilience'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew ? 'היפנוזה לחיזוק ביטחון עצמי' : 'Confidence-boosting hypnosis'}
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
                onClick={() => handleStartHypnosis('focus')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{isHebrew ? 'שיפור ריכוז' : 'Improve Focus'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew ? 'היפנוזה לחידוד המיקוד המנטלי' : 'Sharpen mental clarity'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Emotional Check-in Prompt */}
          <Card className="bg-gradient-to-r from-pink-500/5 to-red-500/5 border-pink-500/20">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isHebrew 
                  ? 'צ׳אט עם אורורה כדי לשתף איך אתה מרגיש'
                  : 'Chat with Aurora to share how you\'re feeling'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getStressLabel(level: string | null, isHebrew: boolean): string {
  const labels: Record<string, { he: string; en: string }> = {
    low: { he: 'נמוכה', en: 'Low' },
    moderate: { he: 'בינונית', en: 'Moderate' },
    high: { he: 'גבוהה', en: 'High' },
  };
  return labels[level || '']?.[isHebrew ? 'he' : 'en'] || (isHebrew ? 'לא צוין' : 'Not specified');
}

function getStressColor(level: string | null): string {
  switch (level) {
    case 'low': return 'bg-green-500/20 text-green-500';
    case 'moderate': return 'bg-amber-500/20 text-amber-500';
    case 'high': return 'bg-red-500/20 text-red-500';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getStressProgress(level: string | null): number {
  switch (level) {
    case 'low': return 30;
    case 'moderate': return 60;
    case 'high': return 90;
    default: return 50;
  }
}

export default MentalHealthModal;
