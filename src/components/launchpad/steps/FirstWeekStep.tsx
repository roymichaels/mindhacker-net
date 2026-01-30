import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Zap, Briefcase, Rocket, Check, Loader2, RefreshCw, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransformationPlan {
  habits_to_quit: string[];
  habits_to_build: string[];
  career_status: string;
  career_goal: string;
  career_steps: string[];
  challenge_mission: string;
  [key: string]: unknown;
}

interface FirstWeekStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

interface TransformationPlan {
  habits_to_quit: string[];
  habits_to_build: string[];
  career_status: string;
  career_goal: string;
  career_steps: string[];
  challenge_mission: string;
}

interface AISuggestion {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
}

interface AITransformationPlan {
  habits_to_quit: AISuggestion[];
  habits_to_build: AISuggestion[];
  career_steps: AISuggestion[];
  challenge_missions: AISuggestion[];
}

// Habits to quit - things that hold people back
const HABITS_TO_QUIT: AISuggestion[] = [
  { id: 'scrolling', icon: '📱', label: 'סקרולינג אינסופי ברשתות', labelEn: 'Endless social media scrolling' },
  { id: 'procrastination', icon: '⏰', label: 'דחיינות ודחיית משימות', labelEn: 'Procrastination' },
  { id: 'binge_watching', icon: '📺', label: 'צפייה מוגזמת בנטפליקס/יוטיוב', labelEn: 'Binge watching Netflix/YouTube' },
  { id: 'emotional_eating', icon: '🍕', label: 'אכילה רגשית', labelEn: 'Emotional eating' },
  { id: 'negative_self_talk', icon: '🗣️', label: 'דיבור עצמי שלילי', labelEn: 'Negative self-talk' },
  { id: 'toxic_relationships', icon: '👥', label: 'יחסים שמדכאים אותי', labelEn: 'Draining relationships' },
  { id: 'complaining', icon: '😤', label: 'תלונות ושליליות', labelEn: 'Complaining & negativity' },
  { id: 'wasted_time', icon: '⌛', label: 'בזבוז זמן על דברים לא חשובים', labelEn: 'Wasting time on unimportant things' },
  { id: 'late_nights', icon: '🌙', label: 'שהייה ערים עד מאוחר בלי סיבה', labelEn: 'Staying up late for no reason' },
  { id: 'junk_food', icon: '🍔', label: 'אוכל זבל ושתייה מתוקה', labelEn: 'Junk food & sugary drinks' },
];

// Habits to build - elite habits
const HABITS_TO_BUILD: AISuggestion[] = [
  { id: 'morning_routine', icon: '🌅', label: 'שגרת בוקר מובנית', labelEn: 'Structured morning routine' },
  { id: 'daily_exercise', icon: '💪', label: 'פעילות גופנית יומית', labelEn: 'Daily exercise' },
  { id: 'daily_learning', icon: '📚', label: 'למידה יומית (30+ דקות)', labelEn: 'Daily learning (30+ min)' },
  { id: 'work_on_business', icon: '🏗️', label: 'עבודה על הפרויקט/העסק שלי', labelEn: 'Work on my project/business' },
  { id: 'skill_practice', icon: '🎯', label: 'תרגול מיומנות מקצועית', labelEn: 'Professional skill practice' },
  { id: 'reading', icon: '📖', label: 'קריאת ספרים (לא רשתות)', labelEn: 'Reading books (not social media)' },
  { id: 'networking', icon: '🤝', label: 'נטוורקינג ויצירת קשרים', labelEn: 'Networking & connections' },
  { id: 'meditation', icon: '🧘', label: 'מדיטציה / רפלקציה יומית', labelEn: 'Daily meditation / reflection' },
  { id: 'journaling', icon: '✍️', label: 'כתיבה יומית / תיעוד רעיונות', labelEn: 'Daily journaling / ideas' },
  { id: 'cold_exposure', icon: '🥶', label: 'מקלחת קרה / אתגר פיזי', labelEn: 'Cold shower / physical challenge' },
];

// Career status options
const CAREER_STATUS: AISuggestion[] = [
  { id: 'employee_happy', icon: '😊', label: 'שכיר מרוצה', labelEn: 'Happy employee' },
  { id: 'employee_unhappy', icon: '😔', label: 'שכיר לא מרוצה', labelEn: 'Unhappy employee' },
  { id: 'freelancer', icon: '💼', label: 'עצמאי / פרילנסר', labelEn: 'Freelancer' },
  { id: 'early_entrepreneur', icon: '🌱', label: 'יזם בתחילת הדרך', labelEn: 'Early-stage entrepreneur' },
  { id: 'small_business', icon: '🏪', label: 'בעל עסק קטן', labelEn: 'Small business owner' },
  { id: 'growing_business', icon: '📈', label: 'בעל עסק בצמיחה', labelEn: 'Growing business owner' },
  { id: 'job_seeker', icon: '🔍', label: 'מחפש עבודה', labelEn: 'Job seeker' },
  { id: 'student', icon: '🎓', label: 'סטודנט', labelEn: 'Student' },
];

// Career goals
const CAREER_GOALS: AISuggestion[] = [
  { id: 'start_business', icon: '🚀', label: 'לפתוח עסק עצמאי', labelEn: 'Start my own business' },
  { id: 'grow_business', icon: '📊', label: 'לצמוח בעסק הקיים', labelEn: 'Grow my existing business' },
  { id: 'change_career', icon: '🔄', label: 'להחליף מקצוע/קריירה', labelEn: 'Change career' },
  { id: 'get_promoted', icon: '⬆️', label: 'להתקדם בארגון', labelEn: 'Get promoted' },
  { id: 'earn_more', icon: '💰', label: 'להרוויח יותר', labelEn: 'Earn more money' },
  { id: 'freedom', icon: '🦅', label: 'חופש וגמישות', labelEn: 'Freedom & flexibility' },
  { id: 'leadership', icon: '👑', label: 'השפעה ומנהיגות', labelEn: 'Influence & leadership' },
  { id: 'passive_income', icon: '💎', label: 'הכנסה פסיבית', labelEn: 'Passive income' },
];

// Fallback career steps
const FALLBACK_CAREER_STEPS: AISuggestion[] = [
  { id: 'identify_skill', icon: '🎯', label: 'זהה מיומנות אחת לפתח השבוע', labelEn: 'Identify one skill to develop this week' },
  { id: 'reach_out', icon: '📧', label: 'שלח הודעה לאדם שיכול לעזור לקריירה', labelEn: 'Reach out to someone who can help your career' },
  { id: 'research', icon: '🔍', label: 'חקור את השוק שלך לעומק', labelEn: 'Research your market deeply' },
  { id: 'create_content', icon: '📝', label: 'צור תוכן אחד שמציג את המומחיות שלך', labelEn: 'Create content showcasing your expertise' },
  { id: 'learn_selling', icon: '💼', label: 'למד מכירות - זה הכל בעסקים', labelEn: 'Learn sales - it\'s everything in business' },
];

// Fallback challenge missions
const FALLBACK_CHALLENGES: AISuggestion[] = [
  { id: 'call_10', icon: '📞', label: 'התקשר ל-10 לקוחות פוטנציאליים', labelEn: 'Call 10 potential clients' },
  { id: 'publish', icon: '🌐', label: 'פרסם משהו שמפחיד אותך', labelEn: 'Publish something that scares you' },
  { id: 'ask_raise', icon: '💵', label: 'בקש העלאה או העלה מחירים', labelEn: 'Ask for a raise or raise prices' },
  { id: 'quit_bad', icon: '🚫', label: 'עזוב הרגל אחד רע לשבוע שלם', labelEn: 'Quit one bad habit for a full week' },
  { id: 'meet_mentor', icon: '🤝', label: 'פגוש מנטור או מומחה בתחום', labelEn: 'Meet a mentor or expert in your field' },
];

export function FirstWeekStep({ onComplete, isCompleting, rewards }: FirstWeekStepProps) {
  const { language, isRTL } = useTranslation();
  
  // State for selections
  const [selectedQuit, setSelectedQuit] = useState<string[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<string[]>([]);
  const [selectedCareerStatus, setSelectedCareerStatus] = useState<string>('');
  const [selectedCareerGoal, setSelectedCareerGoal] = useState<string>('');
  const [selectedCareerSteps, setSelectedCareerSteps] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  
  // AI personalized suggestions
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [aiCareerSteps, setAiCareerSteps] = useState<AISuggestion[]>(FALLBACK_CAREER_STEPS);
  const [aiChallenges, setAiChallenges] = useState<AISuggestion[]>(FALLBACK_CHALLENGES);

  // Current section (for mobile flow)
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3 | 4>(1);

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session, using fallback suggestions');
        setIsLoadingSuggestions(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-first-week-actions', {
        body: { 
          language,
          careerStatus: selectedCareerStatus,
          careerGoal: selectedCareerGoal 
        }
      });

      if (error) {
        console.error('Error loading suggestions:', error);
        if (error.message?.includes('429')) {
          toast.error(language === 'he' ? 'יותר מדי בקשות, נסה שוב עוד רגע' : 'Too many requests, try again shortly');
        }
        return;
      }

      if (data?.career_steps && data.career_steps.length > 0) {
        setAiCareerSteps(data.career_steps);
      }
      if (data?.challenge_missions && data.challenge_missions.length > 0) {
        setAiChallenges(data.challenge_missions);
      }
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    // Load AI suggestions when career status/goal are selected
    if (selectedCareerStatus && selectedCareerGoal) {
      loadSuggestions();
    } else {
      setIsLoadingSuggestions(false);
    }
  }, [selectedCareerStatus, selectedCareerGoal, language]);

  const toggleQuit = (label: string) => {
    setSelectedQuit(prev => 
      prev.includes(label) ? prev.filter(h => h !== label) : [...prev, label]
    );
  };

  const toggleBuild = (label: string) => {
    setSelectedBuild(prev => 
      prev.includes(label) ? prev.filter(h => h !== label) : [...prev, label]
    );
  };

  const toggleCareerStep = (label: string) => {
    setSelectedCareerSteps(prev => {
      if (prev.includes(label)) return prev.filter(s => s !== label);
      if (prev.length >= 3) return [...prev.slice(1), label];
      return [...prev, label];
    });
  };

  const isValid = 
    selectedQuit.length >= 1 && 
    selectedBuild.length >= 1 && 
    selectedCareerStatus && 
    selectedCareerGoal && 
    selectedCareerSteps.length >= 1 &&
    selectedChallenge;

  const handleSubmit = () => {
    if (isValid) {
      onComplete({
        habits_to_quit: selectedQuit,
        habits_to_build: selectedBuild,
        career_status: selectedCareerStatus,
        career_goal: selectedCareerGoal,
        career_steps: selectedCareerSteps,
        challenge_mission: selectedChallenge
      });
    }
  };

  const renderSection = (
    title: string,
    titleEn: string,
    icon: React.ReactNode,
    iconColor: string,
    items: AISuggestion[],
    selected: string[],
    onToggle: (label: string) => void,
    multiSelect: boolean = true,
    singleValue?: string,
    onSingleSelect?: (label: string) => void
  ) => {
    const isSingleSelect = !multiSelect && onSingleSelect;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", iconColor)}>
            {icon}
          </div>
          <h3 className="font-bold text-lg">
            {language === 'he' ? title : titleEn}
          </h3>
          {multiSelect && (
            <span className="text-sm text-muted-foreground ms-auto">
              {selected.length} {language === 'he' ? 'נבחרו' : 'selected'}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const label = language === 'he' ? item.label : item.labelEn;
            const isSelected = isSingleSelect ? singleValue === label : selected.includes(label);
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * index }}
                onClick={() => isSingleSelect ? onSingleSelect(label) : onToggle(label)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-start",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" 
                    : "bg-muted/50 hover:bg-muted border border-border hover:border-primary/50"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 ms-1" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          {language === 'he' ? 'בניית הגרסה הבאה שלך' : 'Building Your Next Version'}
        </h1>
        
        <p className="text-muted-foreground max-w-lg mx-auto">
          {language === 'he' 
            ? 'הגיע הזמן לקבל החלטות אמיתיות. לא טיפים קטנים - תכנית טרנספורמציה.'
            : 'Time to make real decisions. Not small tips - a transformation plan.'
          }
        </p>
      </div>

      {/* Section 1: Habits to Quit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-2xl p-5 border border-red-500/20"
      >
        {renderSection(
          '🚫 מה להפסיק',
          '🚫 What to Stop',
          <Trash2 className="w-5 h-5 text-red-500" />,
          'bg-red-500/10',
          HABITS_TO_QUIT,
          selectedQuit,
          toggleQuit
        )}
        
        <AnimatePresence>
          {selectedQuit.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-red-500/10 rounded-lg p-3"
            >
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                {language === 'he' ? 'הרגלים שאני מתחייב לעזוב:' : 'Habits I commit to quitting:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedQuit.map((habit, i) => (
                  <span key={i} className="text-xs bg-red-500/20 px-2 py-1 rounded-full">
                    {habit}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Section 2: Habits to Build */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl p-5 border border-green-500/20"
      >
        {renderSection(
          '🏗️ מה לבנות',
          '🏗️ What to Build',
          <Plus className="w-5 h-5 text-green-500" />,
          'bg-green-500/10',
          HABITS_TO_BUILD,
          selectedBuild,
          toggleBuild
        )}
        
        <AnimatePresence>
          {selectedBuild.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-green-500/10 rounded-lg p-3"
            >
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                {language === 'he' ? 'הרגלים חדשים שאני בונה:' : 'New habits I\'m building:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedBuild.map((habit, i) => (
                  <span key={i} className="text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    {habit}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Section 3: Career & Business */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl p-5 border border-blue-500/20 space-y-6"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-bold text-lg">
            {language === 'he' ? '💼 קריירה ופרנסה' : '💼 Career & Business'}
          </h3>
        </div>

        {/* Current Status */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {language === 'he' ? 'המצב הנוכחי שלי:' : 'My current status:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {CAREER_STATUS.map((status) => {
              const label = language === 'he' ? status.label : status.labelEn;
              const isSelected = selectedCareerStatus === label;
              return (
                <button
                  key={status.id}
                  onClick={() => setSelectedCareerStatus(label)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all",
                    isSelected 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "bg-muted/50 hover:bg-muted border border-border"
                  )}
                >
                  <span>{status.icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Career Goal */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {language === 'he' ? 'המטרה שלי:' : 'My goal:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {CAREER_GOALS.map((goal) => {
              const label = language === 'he' ? goal.label : goal.labelEn;
              const isSelected = selectedCareerGoal === label;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedCareerGoal(label)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all",
                    isSelected 
                      ? "bg-indigo-500 text-white shadow-lg" 
                      : "bg-muted/50 hover:bg-muted border border-border"
                  )}
                >
                  <span>{goal.icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Career Steps - AI Generated */}
        {selectedCareerStatus && selectedCareerGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-4 border-t border-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {language === 'he' ? 'צעדים קונקרטיים השבוע (בחר עד 3):' : 'Concrete steps this week (choose up to 3):'}
              </p>
              {isLoadingSuggestions && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {!isLoadingSuggestions && (
                <button
                  onClick={loadSuggestions}
                  className="p-1 rounded hover:bg-muted"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-600 dark:text-purple-400">
                {language === 'he' ? 'מותאם אישית למטרה שלך' : 'Personalized to your goal'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {aiCareerSteps.map((step, index) => {
                const label = language === 'he' ? step.label : step.labelEn;
                const isSelected = selectedCareerSteps.includes(label);
                const selectionIndex = selectedCareerSteps.indexOf(label);
                return (
                  <motion.button
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.03 * index }}
                    onClick={() => toggleCareerStep(label)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all",
                      isSelected 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : "bg-muted/50 hover:bg-muted border border-border"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                        {selectionIndex + 1}
                      </span>
                    )}
                    <span>{step.icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Section 4: Challenge Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl p-5 border border-amber-500/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-lg">
            {language === 'he' ? '⚡ משימת אתגר' : '⚡ Challenge Mission'}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'he' 
            ? 'דבר אחד שמפחיד אותך אבל יזיז אותך קדימה. בחר אחד ועשה אותו השבוע!'
            : 'One thing that scares you but will push you forward. Pick one and do it this week!'
          }
        </p>

        <div className="flex flex-wrap gap-2">
          {aiChallenges.map((challenge, index) => {
            const label = language === 'he' ? challenge.label : challenge.labelEn;
            const isSelected = selectedChallenge === label;
            return (
              <motion.button
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.03 * index }}
                onClick={() => setSelectedChallenge(label)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl transition-all",
                  isSelected 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-[1.02]" 
                    : "bg-muted/50 hover:bg-muted border border-border hover:border-amber-500/50"
                )}
              >
                <span className="text-lg">{challenge.icon}</span>
                <span className="text-sm font-medium">{label}</span>
                {isSelected && <Zap className="w-4 h-4" />}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedChallenge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4"
            >
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {language === 'he' ? '🎯 משימת האתגר שלי השבוע:' : '🎯 My challenge mission this week:'}
              </p>
              <p className="text-base font-medium mt-1">{selectedChallenge}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit */}
      <div className="text-center space-y-4 pt-4">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>+{rewards.xp} XP</span>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={!isValid || isCompleting}
          className="min-w-[220px] h-14 text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {isCompleting 
            ? (language === 'he' ? 'שומר את התכנית...' : 'Saving plan...') 
            : (language === 'he' ? '🚀 בוא נתחיל!' : '🚀 Let\'s Go!')
          }
        </Button>
        
        {!isValid && (
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {language === 'he' 
              ? 'בחר לפחות: הרגל אחד לעזוב, הרגל אחד לבנות, מצב קריירה ומטרה, צעד אחד ומשימת אתגר'
              : 'Select at least: 1 habit to quit, 1 to build, career status & goal, 1 step, and a challenge'
            }
          </p>
        )}
      </div>
    </div>
  );
}

export default FirstWeekStep;
