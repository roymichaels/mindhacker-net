import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface IntrospectionStepProps {
  onComplete: (data: { form_submission_id?: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

export function IntrospectionStep({ onComplete, isCompleting, rewards }: IntrospectionStepProps) {
  const { language, isRTL } = useTranslation();
  const [completed, setCompleted] = useState(false);

  const handleStartQuestionnaire = () => {
    // Open the introspection form in a new tab or modal
    // For now, we'll simulate completion
    window.open('/form/introspection', '_blank');
  };

  const handleMarkComplete = () => {
    // In a real implementation, this would check if the form was submitted
    // and pass the form_submission_id
    onComplete({});
  };

  return (
    <div className="space-y-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        
        <h1 className="text-3xl font-bold">
          {language === 'he' ? 'מסע התבוננות פנימית' : 'Introspection Journey'}
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'שאלון עומק שיעזור לי להבין אותך טוב יותר. בסוף תקבל ניתוח AI עם תובנות ונקודות עיוורון.'
            : "A deep questionnaire that will help me understand you better. At the end, you'll receive an AI analysis with insights and blind spots."
          }
        </p>
      </motion.div>

      {/* What you'll get */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-muted/30 rounded-xl p-6 text-start space-y-4"
      >
        <h3 className="font-semibold">
          {language === 'he' ? 'מה תקבל:' : "What you'll get:"}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            {language === 'he' ? 'ניתוח AI של דפוסי החשיבה שלך' : 'AI analysis of your thought patterns'}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            {language === 'he' ? '3 תובנות מפתח' : '3 key insights'}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            {language === 'he' ? '3 נקודות עיוורון' : '3 blind spots'}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            {language === 'he' ? 'המלצות לצעדים הבאים' : 'Recommendations for next steps'}
          </li>
        </ul>
      </motion.div>

      {/* Rewards preview */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4 text-sm"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
          <span>+{rewards.xp} XP</span>
        </div>
        {rewards.tokens > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600">
            <Gift className="w-4 h-4" />
            <span>+{rewards.tokens} {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <Button 
          size="lg" 
          onClick={handleStartQuestionnaire}
          className="min-w-[200px] gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {language === 'he' ? 'התחל שאלון' : 'Start Questionnaire'}
        </Button>
        
        <div>
          <Button 
            variant="ghost" 
            onClick={handleMarkComplete}
            disabled={isCompleting}
          >
            {isCompleting 
              ? (language === 'he' ? 'שומר...' : 'Saving...') 
              : (language === 'he' ? 'כבר מילאתי / דלג' : 'Already completed / Skip')
            }
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default IntrospectionStep;
