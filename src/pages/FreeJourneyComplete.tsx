import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGuestLaunchpadProgress } from '@/hooks/useGuestLaunchpadProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Loader2, Rocket, Sparkles, Gift, Download, ArrowRight, UserPlus, 
  MessageCircle, Music, Trophy, Star, Zap, Brain, Target, ChevronDown,
  Crown, Shield, Flame
} from 'lucide-react';
import { SummaryScores } from '@/components/launchpad/summary/SummaryScores';
import { ConsciousnessAnalysis } from '@/components/launchpad/summary/ConsciousnessAnalysis';
import { IdentityProfile } from '@/components/launchpad/summary/IdentityProfile';
import { PlanPreview } from '@/components/launchpad/summary/PlanPreview';
import { LifeDirectionSection } from '@/components/launchpad/summary/LifeDirectionSection';
import { useGuestPDF } from '@/hooks/useGuestPDF';
import { GuestPDFRenderer } from '@/components/pdf/GuestPDFRenderer';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { generateOrbThreads, DEFAULT_MULTI_THREAD_PROFILE, type MultiThreadOrbProfile } from '@/lib/orbDNAThreads';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface GuestResult {
  summary: {
    consciousness_analysis?: {
      current_state: string;
      dominant_patterns: string[];
      blind_spots: string[];
      strengths: string[];
      growth_edges: string[];
    };
    identity_profile?: {
      dominant_traits: string[];
      suggested_ego_state: string;
      values_hierarchy: string[];
      identity_title?: {
        title?: string;
        title_en?: string;
        icon?: string;
      };
    };
    behavioral_insights?: {
      habits_to_transform: string[];
      habits_to_cultivate: string[];
      resistance_patterns: string[];
    };
    life_direction?: {
      core_aspiration?: string;
      vision_summary?: string;
      clarity_score?: number;
    };
  };
  plan: {
    months: Array<{
      number: number;
      title: string;
      title_he?: string;
      focus: string;
      milestone: string;
    }>;
  };
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
}

// Generate orb profile from guest data
function generateGuestOrbProfile(result: GuestResult): MultiThreadOrbProfile {
  // Try to get hobbies from localStorage
  let hobbies: string[] = [];
  try {
    const profileData = localStorage.getItem('launchpad_personal_profile');
    if (profileData) {
      const parsed = JSON.parse(profileData);
      hobbies = parsed.hobbies || [];
    }
  } catch (e) {
    console.error('Error parsing profile data:', e);
  }

  // Generate orb profile
  return generateOrbThreads(
    result.summary as any,
    hobbies,
    result.scores.consciousness
  );
}

export default function FreeJourneyComplete() {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLaunchpadComplete, isLoading: launchpadLoading } = useLaunchpadProgress();
  const { isLaunchpadComplete: isGuestComplete, getGuestData } = useGuestLaunchpadProgress();
  const { downloadPDF, generating, containerRef, pdfData, showRenderer } = useGuestPDF();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<GuestResult | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [celebrationDone, setCelebrationDone] = useState(false);

  useSEO({
    title: isRTL ? 'התוצאות שלך | MindOS' : 'Your Results | MindOS',
    description: isRTL 
      ? 'ניתוח התודעה שלך, פרופיל הזהות האישי ותוכנית 90 היום שלך מוכנים!'
      : 'Your consciousness analysis, personal identity profile and 90-day plan are ready!',
  });

  // Redirect authenticated users who have completed launchpad
  useEffect(() => {
    if (authLoading || launchpadLoading) return;
    
    if (user && isLaunchpadComplete) {
      // User already has completed launchpad - go to their completion page
      navigate('/launchpad/complete', { replace: true });
    }
  }, [user, authLoading, launchpadLoading, isLaunchpadComplete, navigate]);

  // Generate orb profile
  const orbProfile = useMemo(() => {
    if (!result) return DEFAULT_MULTI_THREAD_PROFILE;
    return generateGuestOrbProfile(result);
  }, [result]);

  // Get identity title
  const identityTitle = useMemo(() => {
    if (!result?.summary?.identity_profile?.identity_title) return null;
    const title = result.summary.identity_profile.identity_title;
    return {
      title: language === 'he' ? (title.title || title.title_en || '') : (title.title_en || title.title || ''),
      icon: title.icon || '✨',
    };
  }, [result, language]);

  useEffect(() => {
    // Load result from localStorage
    try {
      const stored = localStorage.getItem('guest_launchpad_result');
      if (stored) {
        setResult(JSON.parse(stored));
        setLoading(false);
        return;
      }
      
      // If no stored result but guest journey is complete, redirect to get results
      // This handles returning guests who cleared browser data
      if (!isGuestComplete) {
        // Guest hasn't completed the journey - redirect to start
        navigate('/free-journey', { replace: true });
      } else {
        // Guest completed but result not found - they may need to regenerate
        // Show a message or redirect to continue
        navigate('/guest-launchpad', { replace: true });
      }
    } catch {
      navigate('/free-journey', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate, isGuestComplete]);

  // Celebration confetti
  useEffect(() => {
    if (result && !celebrationDone) {
      setCelebrationDone(true);
      // Delay confetti for better effect
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.3 },
          colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'],
        });
      }, 500);
    }
  }, [result, celebrationDone]);

  const handleDownloadPDF = async () => {
    if (!result) return;
    await downloadPDF(result);
  };

  const handleSignup = () => {
    localStorage.setItem('migrate_guest_launchpad', 'true');
    navigate('/signup');
  };

  const handleStartAurora = () => {
    localStorage.setItem('migrate_guest_launchpad', 'true');
    navigate('/signup?redirect=/aurora');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative w-24 h-24 mx-auto">
            <MultiThreadOrb profile={DEFAULT_MULTI_THREAD_PROFILE} size={96} />
          </div>
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground animate-pulse">
              {language === 'he' ? 'מכין את התוצאות שלך...' : 'Preparing your results...'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  const rewards = [
    { icon: Trophy, value: '+100', label: language === 'he' ? 'XP' : 'XP', color: 'text-amber-500' },
    { icon: Zap, value: '+50', label: language === 'he' ? 'טוקנים' : 'Tokens', color: 'text-violet-500' },
    { icon: Star, value: 'Lvl 1', label: language === 'he' ? 'רמה' : 'Level', color: 'text-cyan-500' },
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-x-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hero Section with Orb */}
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Celebration banner */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative z-10 mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-primary/20 to-accent/20 border border-primary/30 backdrop-blur-sm">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
              {language === 'he' ? 'מסע הטרנספורמציה הושלם!' : 'Transformation Journey Complete!'}
            </span>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </motion.div>

        {/* Main Orb */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', duration: 0.8 }}
          className="relative z-10"
        >
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            <MultiThreadOrb profile={orbProfile} size={224} showGlow />
            
            {/* Identity badge */}
            {identityTitle && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.2, type: 'spring' }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 border border-primary/30 shadow-xl backdrop-blur-sm">
                  <span className="text-xl">{identityTitle.icon}</span>
                  <span className="font-bold text-sm">{identityTitle.title}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Rewards unlocked */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 mt-12 flex items-center gap-4"
        >
          {rewards.map((reward, i) => (
            <motion.div
              key={reward.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.15, type: 'spring' }}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm min-w-[80px]"
            >
              <reward.icon className={cn("w-6 h-6", reward.color)} />
              <span className="font-bold text-lg">{reward.value}</span>
              <span className="text-xs text-muted-foreground">{reward.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-10 mt-8 text-center max-w-xl px-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {language === 'he' ? (
              <>ה-<span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">DNA הדיגיטלי</span> שלך נוצר!</>
            ) : (
              <>Your <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Digital DNA</span> is Ready!</>
            )}
          </h1>
          <p className="text-muted-foreground">
            {language === 'he'
              ? 'Aurora ניתחה את הנתונים שלך ויצרה פרופיל זהות ייחודי ותוכנית טרנספורמציה אישית'
              : 'Aurora analyzed your data and created a unique identity profile and personalized transformation plan'}
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-6">
        {/* Scores Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
            <SummaryScores
              consciousnessScore={result.scores.consciousness}
              clarityScore={result.scores.clarity}
              readinessScore={result.scores.readiness}
            />
          </Card>
        </motion.div>

        {/* Toggle for more analysis */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="w-full justify-between h-14 px-6 bg-card/30 border border-border/30"
          >
            <span className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              {language === 'he' ? 'הצג ניתוח מלא' : 'Show Full Analysis'}
            </span>
            <ChevronDown className={cn(
              "w-5 h-5 transition-transform",
              showFullAnalysis && "rotate-180"
            )} />
          </Button>
        </motion.div>

        {/* Expandable Analysis */}
        <AnimatePresence>
          {showFullAnalysis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {result.summary?.identity_profile && (
                <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                  <IdentityProfile
                    profile={result.summary.identity_profile}
                    behavioral={result.summary.behavioral_insights}
                  />
                </Card>
              )}

              {result.summary?.consciousness_analysis && (
                <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                  <ConsciousnessAnalysis analysis={result.summary.consciousness_analysis} />
                </Card>
              )}

              {result.summary?.life_direction && (
                <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                  <LifeDirectionSection lifeDirection={result.summary.life_direction} />
                </Card>
              )}

              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <PlanPreview
                  months={result.plan?.months || []}
                  onViewFullPlan={() => {}}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download PDF */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={generating}
            className="w-full h-14 gap-3 bg-card/30 border-primary/30 hover:bg-primary/10"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'he' ? 'יוצר PDF...' : 'Generating PDF...'}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {language === 'he' ? 'הורד את הפרופיל המלא (PDF)' : 'Download Full Profile (PDF)'}
              </>
            )}
          </Button>
        </motion.div>

        {/* CTA Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="space-y-4"
        >
          {/* Primary CTA - Start with Aurora */}
          <Card className="p-6 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-bold">
                    {language === 'he' ? 'התחל שיחה עם Aurora' : 'Start Chatting with Aurora'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'he' 
                      ? 'המאמנת האישית שלך מכירה אותך כבר - התחל לעבוד על המטרות שלך עכשיו'
                      : 'Your personal coach already knows you - start working on your goals now'}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleStartAurora}
                  className="w-full h-12 gap-2 shadow-xl shadow-primary/20"
                >
                  <Sparkles className="w-5 h-5" />
                  {language === 'he' ? 'התחל עכשיו - חינם!' : 'Start Now - Free!'}
                  <ArrowRight className={cn("w-5 h-5", isRTL && "rotate-180")} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Secondary benefits */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-card/50 border-border/50 backdrop-blur-sm text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Music className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-sm font-medium">{language === 'he' ? 'סשני היפנוזה' : 'Hypnosis Sessions'}</p>
              <p className="text-xs text-muted-foreground">{language === 'he' ? 'מותאמים אישית' : 'Personalized'}</p>
            </Card>
            
            <Card className="p-4 bg-card/50 border-border/50 backdrop-blur-sm text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm font-medium">{language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}</p>
              <p className="text-xs text-muted-foreground">{language === 'he' ? 'מעקב מלא' : 'Full tracking'}</p>
            </Card>
          </div>

          {/* Simple signup CTA */}
          <Card className="p-5 bg-card/30 border-border/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{language === 'he' ? 'שמור את הנתונים שלך' : 'Save Your Data'}</p>
                  <p className="text-xs text-muted-foreground">{language === 'he' ? 'גישה מכל מכשיר' : 'Access from any device'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignup} className="gap-1">
                <UserPlus className="w-4 h-4" />
                {language === 'he' ? 'הרשמה' : 'Sign Up'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Login link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="text-center text-sm text-muted-foreground"
        >
          {language === 'he' ? 'כבר יש לך חשבון?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {language === 'he' ? 'התחבר' : 'Log in'}
          </Link>
        </motion.p>
      </div>

      {/* Hidden PDF Renderer */}
      {showRenderer && pdfData && (
        <GuestPDFRenderer ref={containerRef} data={pdfData} />
      )}
    </div>
  );
}
