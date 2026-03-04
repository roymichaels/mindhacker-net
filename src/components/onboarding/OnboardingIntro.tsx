/**
 * OnboardingIntro — Dopaminic animated welcome splash + auth + basic info collection.
 * Phase 1: Animated welcome with brand orb + tagline
 * Phase 2: Signup/Login (skipped if already authenticated)
 * Phase 3: Name, Gender, Age bracket collection
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { ArrowRight, ChevronLeft, Sparkles, User, Calendar, Users, X, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

interface OnboardingIntroProps {
  onComplete: (basicInfo: { name: string; gender: string; ageBracket: string }) => void;
}

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export function OnboardingIntro({ onComplete }: OnboardingIntroProps) {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'splash' | 'auth' | 'info'>('splash');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [ageBracket, setAgeBracket] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auth state
  const [authStep, setAuthStep] = useState<'entry' | 'otp'>('entry');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const emailSchema = z.string().trim().email(t('validation.invalidEmail')).max(255).toLowerCase();

  // When user becomes authenticated while on auth phase, move to info
  useEffect(() => {
    if (user && phase === 'auth') {
      setPhase('info');
    }
  }, [user, phase]);

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

  const handleBegin = () => {
    // If already authenticated, skip auth phase
    if (user) {
      setPhase('info');
    } else {
      setPhase('auth');
    }
  };

  // ─── Auth handlers ───
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({ title: t('validation.validationError'), description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: result.data,
      options: { shouldCreateUser: true },
    });
    setIsAuthLoading(false);
    if (error) {
      toast({ title: t('auth.loginError'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: t('auth.codeSent'), description: t('auth.checkEmail') });
    setAuthStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsAuthLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    setIsAuthLoading(false);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      return;
    }
    if (data.user) {
      toast({ title: t('messages.loginSuccess'), description: t('messages.welcomeBack') });
      // useEffect will move to 'info' phase when user state updates
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/onboarding',
    });
    setIsAuthLoading(false);
    if (error) {
      toast({ title: t('auth.loginError'), description: error.message, variant: 'destructive' });
    }
  };

  const handleAppleSignIn = async () => {
    setIsAuthLoading(true);
    const { error } = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin + '/onboarding',
    });
    setIsAuthLoading(false);
    if (error) {
      toast({ title: t('auth.loginError'), description: error.message, variant: 'destructive' });
    }
  };

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
        ) : phase === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md px-6"
          >
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6 space-y-6">
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex justify-center mb-4"
                >
                  <PersonalizedOrb size={80} state="idle" />
                </motion.div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {authStep === 'otp' ? t('auth.enterCode') : t('auth.connectToMindOS')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {authStep === 'otp'
                    ? `${t('auth.codeSentTo')} ${email}`
                    : t('auth.connectToContinue')}
                </p>
              </div>

              {authStep === 'otp' ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {t('auth.magicLinkSent')}<br />
                      {t('auth.clickLinkToLogin')}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-center text-muted-foreground mb-3">
                      {t('auth.orEnterCode')}
                    </p>
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="flex justify-center" dir="ltr">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isAuthLoading}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button type="submit" className="w-full" disabled={isAuthLoading || otp.length < 6} size="lg">
                        {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <ArrowRight className="h-4 w-4 me-2" />}
                        {t('auth.verifyAndLogin')}
                      </Button>
                    </form>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setAuthStep('entry'); setOtp(''); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
                  >
                    {t('common.back')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Social buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" className="w-full gap-2" disabled={isAuthLoading} onClick={handleGoogleSignIn}>
                      <GoogleIcon />
                      Google
                    </Button>
                    <Button variant="outline" size="lg" className="w-full gap-2" disabled={isAuthLoading} onClick={handleAppleSignIn}>
                      <AppleIcon />
                      Apple
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t('auth.orWithEmail')}</span>
                    </div>
                  </div>

                  {/* Email OTP form */}
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-email">{t('auth.email')}</Label>
                      <Input
                        id="onboarding-email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isAuthLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={isAuthLoading} size="lg">
                      {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      {t('auth.sendCodeToEmail')}
                    </Button>
                  </form>

                  <p className="text-xs text-center text-muted-foreground pt-2">
                    {t('auth.termsAgreement')}
                    <a href="/terms-of-service" target="_blank" className="text-primary hover:underline mx-1">{t('auth.termsOfService')}</a>
                    {t('auth.andThe')}
                    <a href="/privacy-policy" target="_blank" className="text-primary hover:underline mx-1">{t('auth.privacyPolicy')}</a>
                  </p>
                </div>
              )}
            </div>

            {/* Back to splash */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => { setPhase('splash'); setAuthStep('entry'); setOtp(''); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {t('common.back')}
              </button>
            </div>
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

            {/* Back button — only show if not coming from OAuth redirect */}
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
