/**
 * RevealScreen — Screen 10: Personalized summary + Enter MindOS CTA
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import type { FlowAnswers } from '@/lib/flow/types';

interface RevealScreenProps {
  answers: FlowAnswers;
  onComplete: () => void;
  isCompleting: boolean;
}

const PILLAR_LABELS: Record<string, { he: string; en: string }> = {
  health: { he: 'בריאות וגוף', en: 'Health & Body' },
  career: { he: 'קריירה ועבודה', en: 'Career & Work' },
  money: { he: 'כסף ושפע', en: 'Money & Abundance' },
  relationships: { he: 'מערכות יחסים', en: 'Relationships' },
  mind: { he: 'מיינד ורגש', en: 'Mind & Emotional' },
  creativity: { he: 'יצירתיות', en: 'Creativity' },
  social: { he: 'חברה וקהילה', en: 'Social & Community' },
  spirituality: { he: 'רוחניות ומשמעות', en: 'Spirituality & Meaning' },
};

const COMMITMENT_LABELS: Record<string, { he: string; en: string }> = {
  exploring: { he: 'מסתכל', en: 'Exploring' },
  curious: { he: 'סקרן', en: 'Curious' },
  ready: { he: 'מוכן', en: 'Ready' },
  locked_in: { he: 'נעול', en: 'Locked In' },
};

const OBSTACLE_LABELS: Record<string, { he: string; en: string }> = {
  procrastination: { he: 'דחיינות', en: 'Procrastination' },
  fear: { he: 'פחד מכישלון', en: 'Fear of failure' },
  overthinking: { he: 'חשיבת יתר', en: 'Overthinking' },
  no_discipline: { he: 'חוסר משמעת', en: 'Lack of discipline' },
  distraction: { he: 'הסחות דעת', en: 'Distractions' },
  limiting_beliefs: { he: 'אמונות מגבילות', en: 'Limiting beliefs' },
  perfectionism: { he: 'פרפקציוניזם', en: 'Perfectionism' },
  low_energy: { he: 'אנרגיה נמוכה', en: 'Low energy' },
};

export function RevealScreen({ answers, onComplete, isCompleting }: RevealScreenProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  // Extract answers — handle branched pain/outcome IDs
  const primaryFocus = answers.primary_focus as string || '';
  const painKey = `primary_pain_${primaryFocus}`;
  const outcomeKey = `desired_outcome_${primaryFocus}`;
  const commitmentLevel = answers.commitment_level as string || '';
  const coreObstacle = answers.core_obstacle as string || '';
  const identityStatement = answers.identity_statement as string || '';
  const ninetyDayVision = answers.ninety_day_vision as string || '';

  const focusLabel = PILLAR_LABELS[primaryFocus]?.[isHe ? 'he' : 'en'] || primaryFocus;
  const commitmentLabel = COMMITMENT_LABELS[commitmentLevel]?.[isHe ? 'he' : 'en'] || commitmentLevel;
  const obstacleLabel = OBSTACLE_LABELS[coreObstacle]?.[isHe ? 'he' : 'en'] || coreObstacle;

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="flex flex-col items-center text-center space-y-8 px-4 py-8 max-w-md mx-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="text-4xl mb-2">🔮</div>
        <h1 className="text-2xl font-bold text-foreground">
          {isHe ? 'הפרופיל שלך מוכן' : 'Your Profile is Ready'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isHe ? 'זה מה שלמדנו עליך' : 'Here\'s what we learned about you'}
        </p>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="w-full space-y-3">
        {/* Focus */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-start">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            {isHe ? 'תחום פוקוס' : 'Focus Area'}
          </p>
          <p className="text-lg font-bold text-primary">{focusLabel}</p>
        </div>

        {/* Obstacle */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-start">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            {isHe ? 'החסם המרכזי' : 'Biggest Blocker'}
          </p>
          <p className="text-lg font-bold text-destructive">{obstacleLabel}</p>
        </div>

        {/* Commitment */}
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-start">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            {isHe ? 'רמת מחויבות' : 'Commitment Level'}
          </p>
          <p className="text-lg font-bold text-accent-foreground">{commitmentLabel}</p>
        </div>
      </motion.div>

      {/* Identity statement */}
      {identityStatement && (
        <motion.div variants={fadeUp} className="w-full rounded-2xl border border-border bg-card p-4 text-start">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'הזהות החדשה שלך' : 'Your New Identity'}
          </p>
          <p className="text-sm text-foreground italic leading-relaxed">"{identityStatement}"</p>
        </motion.div>
      )}

      {/* Vision */}
      {ninetyDayVision && (
        <motion.div variants={fadeUp} className="w-full rounded-2xl border border-border bg-card p-4 text-start">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
            {isHe ? 'חזון 90 יום' : '90-Day Vision'}
          </p>
          <p className="text-sm text-foreground italic leading-relaxed">"{ninetyDayVision}"</p>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div variants={fadeUp} className="w-full pt-4">
        <Button
          onClick={onComplete}
          disabled={isCompleting}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-xl hover:shadow-primary/20 transition-all"
        >
          {isCompleting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin me-2" />
              {isHe ? 'מכין את המערכת...' : 'Preparing your system...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 me-2" />
              {isHe ? 'כניסה ל-MindOS' : 'Enter MindOS'}
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
