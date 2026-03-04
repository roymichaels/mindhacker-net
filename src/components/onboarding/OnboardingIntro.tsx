/**
 * OnboardingIntro — Dopaminic animated welcome splash + basic info collection.
 * Phase 1: Animated welcome with brand orb + tagline
 * Phase 2: Name, Gender, Age bracket collection
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { ArrowRight, ChevronLeft, Sparkles, User, Calendar, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface OnboardingIntroProps {
  onComplete: (basicInfo: { name: string; gender: string; ageBracket: string }) => void;
}

export function OnboardingIntro({ onComplete }: OnboardingIntroProps) {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'splash' | 'info'>('splash');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [ageBracket, setAgeBracket] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const GENDER_OPTIONS = [
    { value: 'male', label: t('onboarding.intro.male'), icon: '👤' },
    { value: 'female', label: t('onboarding.intro.female'), icon: '👤' },
    { value: 'other', label: t('onboarding.intro.other'), icon: '👤' },
  ];

  const AGE_OPTIONS = [
    { value: '18-24', label: '18-24' },
    { value: '25-30', label: '25-30' },
    { value: '31-40', label: '31-40' },
    { value: '41-50', label: '41-50' },
    { value: '51+', label: '51+' },
  ];

  const handleBegin = () => setPhase('info');

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !gender || !ageBracket) return;
    setIsSaving(true);

    try {
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ full_name: name.trim() })
          .eq('id', user.id);
      }

      onComplete({ name: name.trim(), gender, ageBracket });
    } catch (e) {
      console.error('Error saving basic info:', e);
    } finally {
      setIsSaving(false);
    }
  }, [name, gender, ageBracket, user?.id, onComplete]);

  const isFormValid = name.trim().length >= 2 && gender && ageBracket;

  const featurePills = [
    { icon: '🧠', text: t('onboarding.intro.neuralCalibration') },
    { icon: '⚡', text: t('onboarding.intro.energyOptimization') },
    { icon: '🎯', text: t('onboarding.intro.hundredDayPlan') },
    { icon: '🤖', text: t('onboarding.intro.personalAICoach') },
    { icon: '🧬', text: t('onboarding.intro.fourteenDomains') },
    { icon: '🔮', text: t('onboarding.intro.customHypnosis') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Exit button */}
      <button
        onClick={() => navigate(user ? '/today' : '/')}
        className="absolute top-6 end-6 z-10 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Exit"
      >
        <X className="w-5 h-5" />
      </button>
      <AnimatePresence mode="wait">
        {phase === 'splash' ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 px-6 max-w-md text-center"
          >
            {/* Orb animation */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <PersonalizedOrb size={180} state="idle" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {t('onboarding.intro.welcomeToMindOS')}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('onboarding.intro.description')}
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {featurePills.map((pill) => (
                <span
                  key={pill.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                >
                  <span>{pill.icon}</span>
                  {pill.text}
                </span>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="flex -space-x-2 rtl:space-x-reverse">
                {['🟢', '🔵', '🟣', '🟡'].map((c, i) => (
                  <span key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">{c}</span>
                ))}
              </span>
              <span>{t('onboarding.intro.joiningDaily')}</span>
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBegin}
              className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              {t('onboarding.intro.letsBegin')}
            </motion.button>

            {/* Subtle note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xs text-muted-foreground"
            >
              {t('onboarding.intro.timeNote')}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg px-6 space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6 space-y-6">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t('onboarding.intro.aboutYou')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.intro.tailorSystem')}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {t('onboarding.intro.firstName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('onboarding.intro.enterFirstName')}
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {t('onboarding.intro.gender')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGender(opt.value)}
                      className={cn(
                        'rounded-xl px-3 py-3 text-sm font-medium border transition-all',
                        gender === opt.value
                          ? 'bg-primary/20 border-primary/60 text-foreground'
                          : 'bg-muted/50 border-border text-foreground/80 hover:bg-muted'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age bracket */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t('onboarding.intro.ageRange')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAgeBracket(opt.value)}
                      className={cn(
                        'rounded-xl px-2 py-3 text-sm font-medium border transition-all',
                        ageBracket === opt.value
                          ? 'bg-primary/20 border-primary/60 text-foreground'
                          : 'bg-muted/50 border-border text-foreground/80 hover:bg-muted'
                      )}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <AnimatePresence>
                {isFormValid && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving
                      ? t('onboarding.intro.saving')
                      : t('onboarding.intro.continueToCalibration')}
                    {!isSaving && (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />)}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Back to splash */}
            <div className="flex justify-center">
              <button
                onClick={() => setPhase('splash')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {t('common.back')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}