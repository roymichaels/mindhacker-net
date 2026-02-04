import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lock, Unlock, Eye, X, Headphones, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface SubconsciousHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const SubconsciousHealthModal = ({ isOpen, onClose, language }: SubconsciousHealthModalProps) => {
  const navigate = useNavigate();
  const isHebrew = language === 'he';

  const handleStartHypnosis = (goal: string) => {
    onClose();
    navigate(`/hypnosis?goal=${goal}`);
  };

  const limitingBeliefs = [
    {
      id: 'body_image',
      labelHe: 'דימוי גוף',
      labelEn: 'Body Image',
      descHe: 'אמונות מגבילות על הגוף והמראה',
      descEn: 'Limiting beliefs about body and appearance',
      hypnosisGoal: 'body_image',
    },
    {
      id: 'health_anxiety',
      labelHe: 'חרדת בריאות',
      labelEn: 'Health Anxiety',
      descHe: 'פחדים ודאגות לגבי הבריאות',
      descEn: 'Fears and worries about health',
      hypnosisGoal: 'anxiety',
    },
    {
      id: 'self_sabotage',
      labelHe: 'חבלה עצמית',
      labelEn: 'Self-Sabotage',
      descHe: 'דפוסים שמונעים התקדמות בריאותית',
      descEn: 'Patterns preventing health progress',
      hypnosisGoal: 'habits',
    },
    {
      id: 'emotional_eating',
      labelHe: 'אכילה רגשית',
      labelEn: 'Emotional Eating',
      descHe: 'חיבור בין רגשות לאכילה',
      descEn: 'Connection between emotions and eating',
      hypnosisGoal: 'habits',
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
            <Sparkles className="h-5 w-5" />
            {isHebrew ? 'תת-מודע' : 'Subconscious'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Intro Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-400/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isHebrew 
                    ? 'גלה ושחרר אמונות מגבילות שמשפיעות על הבריאות שלך'
                    : 'Discover and release limiting beliefs affecting your health'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Limiting Beliefs List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'תחומים נפוצים לעבודה' : 'Common Areas to Work On'}
            </h4>
            {limitingBeliefs.map((belief, index) => (
              <motion.div
                key={belief.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-background/60 border-border/50 cursor-pointer hover:border-purple-500/50 transition-colors"
                  onClick={() => handleStartHypnosis(belief.hypnosisGoal)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Lock className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {isHebrew ? belief.labelHe : belief.labelEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isHebrew ? belief.descHe : belief.descEn}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Deep Work CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Unlock className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-400">
                      {isHebrew ? 'עבודה עמוקה' : 'Deep Work'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew 
                        ? 'היפנוזה משולבת לשחרור דפוסים תת-מודעים'
                        : 'Integrated hypnosis for releasing subconscious patterns'}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleStartHypnosis('subconscious')}
                    className="bg-red-600 hover:bg-red-500"
                  >
                    <Headphones className="h-4 w-4 me-1" />
                    {isHebrew ? 'התחל' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubconsciousHealthModal;
