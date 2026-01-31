import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, Rocket, Check, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransformationPlan {
  habits_to_quit: string[];
  habits_to_build: string[];
  career_status: string;
  career_goal: string;
  [key: string]: unknown;
}

interface SavedFirstWeekData {
  selectedQuit?: string[];
  selectedBuild?: string[];
  selectedCareerStatus?: string;
  selectedCareerGoal?: string;
}

interface FirstWeekStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
  savedData?: SavedFirstWeekData;
  onAutoSave?: (data: SavedFirstWeekData) => void;
}

interface TransformationPlanSimple {
  habits_to_quit: string[];
  habits_to_build: string[];
  career_status: string;
  career_goal: string;
}

interface AISuggestion {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
}

// Removed AI-generated challenge missions and career steps - user didn't find them relevant

// Habits to quit - comprehensive list covering all harmful behaviors
const HABITS_TO_QUIT: AISuggestion[] = [
  // Substances & Addictions
  { id: 'alcohol', icon: '🍺', label: 'אלכוהול מוגזם', labelEn: 'Excessive alcohol' },
  { id: 'drugs', icon: '💊', label: 'סמים / שימוש בחומרים', labelEn: 'Drugs / substance use' },
  { id: 'cannabis', icon: '🌿', label: 'הפסקת שימוש בקנאביס', labelEn: 'Stop cannabis use' },
  { id: 'smoking', icon: '🚬', label: 'עישון / ניקוטין', labelEn: 'Smoking / nicotine' },
  { id: 'caffeine', icon: '☕', label: 'קפאין מוגזם', labelEn: 'Excessive caffeine' },
  { id: 'sugar', icon: '🍫', label: 'סוכר והתמכרות למתוקים', labelEn: 'Sugar & sweets addiction' },
  { id: 'gambling', icon: '🎰', label: 'הימורים', labelEn: 'Gambling' },
  { id: 'porn', icon: '🔞', label: 'פורנו / תוכן מיני', labelEn: 'Porn / sexual content' },
  { id: 'gaming', icon: '🎮', label: 'גיימינג כפייתי', labelEn: 'Compulsive gaming' },
  
  // Harmful behaviors
  { id: 'scrolling', icon: '📱', label: 'סקרולינג אינסופי ברשתות', labelEn: 'Endless social media scrolling' },
  { id: 'procrastination', icon: '⏰', label: 'דחיינות ודחיית משימות', labelEn: 'Procrastination' },
  { id: 'binge_watching', icon: '📺', label: 'צפייה מוגזמת בנטפליקס/יוטיוב', labelEn: 'Binge watching Netflix/YouTube' },
  { id: 'emotional_eating', icon: '🍕', label: 'אכילה רגשית / לא בריאה', labelEn: 'Emotional / unhealthy eating' },
  { id: 'junk_food', icon: '🍔', label: 'אוכל זבל ושתייה מתוקה', labelEn: 'Junk food & sugary drinks' },
  { id: 'late_nights', icon: '🌙', label: 'שהייה ערים עד מאוחר', labelEn: 'Staying up late' },
  { id: 'wasted_time', icon: '⌛', label: 'בזבוז זמן על דברים לא חשובים', labelEn: 'Wasting time on unimportant things' },
  { id: 'compulsive_shopping', icon: '🛒', label: 'קניות כפייתיות', labelEn: 'Compulsive shopping' },
  
  // Mental patterns
  { id: 'negative_self_talk', icon: '🗣️', label: 'דיבור עצמי שלילי', labelEn: 'Negative self-talk' },
  { id: 'complaining', icon: '😤', label: 'תלונות ושליליות', labelEn: 'Complaining & negativity' },
  { id: 'comparison', icon: '📊', label: 'השוואה מתמדת לאחרים', labelEn: 'Constant comparison to others' },
  { id: 'excessive_worry', icon: '😰', label: 'דאגנות יתר', labelEn: 'Excessive worrying' },
  { id: 'perfectionism', icon: '🎭', label: 'פרפקציוניזם משתק', labelEn: 'Paralyzing perfectionism' },
  { id: 'overthinking', icon: '💭', label: 'חשיבת יתר (overthinking)', labelEn: 'Overthinking' },
  
  // Relationships
  { id: 'toxic_relationships', icon: '👥', label: 'יחסים שמדכאים אותי', labelEn: 'Draining relationships' },
  { id: 'conflict_avoidance', icon: '🤐', label: 'הימנעות מעימותים נחוצים', labelEn: 'Avoiding necessary conflicts' },
  { id: 'not_listening', icon: '👂', label: 'אי-הקשבה / קטיעת אנשים', labelEn: 'Not listening / interrupting' },
  { id: 'gossip', icon: '🗨️', label: 'רכילות ולשון הרע', labelEn: 'Gossip & bad-mouthing' },
  { id: 'self_isolation', icon: '🙈', label: 'בידוד עצמי מהעולם', labelEn: 'Self-isolation' },
  { id: 'codependency', icon: '🧲', label: 'תלות יתר באחרים', labelEn: 'Over-dependency on others' },
  
  // Financial
  { id: 'reckless_spending', icon: '💸', label: 'הוצאות לא מחושבות', labelEn: 'Reckless spending' },
  { id: 'living_beyond_means', icon: '💳', label: 'חיים מעבר ליכולת', labelEn: 'Living beyond means' },
  { id: 'financial_avoidance', icon: '📉', label: 'הימנעות מלהסתכל על המצב הכלכלי', labelEn: 'Avoiding financial reality' },
  
  // Other
  { id: 'chronic_lateness', icon: '⏱️', label: 'איחורים כרוניים', labelEn: 'Chronic lateness' },
  { id: 'small_lies', icon: '🤥', label: 'שקרים קטנים', labelEn: 'Small lies' },
  { id: 'anger_outbursts', icon: '😡', label: 'התפרצויות כעס', labelEn: 'Anger outbursts' },
  { id: 'saying_yes_always', icon: '🙅', label: 'אמירת כן לכל דבר', labelEn: 'Saying yes to everything' },
];

// Habits to build - comprehensive elite habits
const HABITS_TO_BUILD: AISuggestion[] = [
  // Routines & Structure
  { id: 'morning_routine', icon: '🌅', label: 'שגרת בוקר מובנית', labelEn: 'Structured morning routine' },
  { id: 'weekly_planning', icon: '📋', label: 'תכנון יום/שבוע מראש', labelEn: 'Daily/weekly planning ahead' },
  { id: 'daily_goals', icon: '🎯', label: 'הגדרת מטרות יומיות', labelEn: 'Setting daily goals' },
  { id: 'task_completion', icon: '✅', label: 'סיום משימות עד הסוף', labelEn: 'Completing tasks fully' },
  { id: 'saying_no', icon: '🚫', label: 'אמירת "לא" לדברים לא חשובים', labelEn: 'Saying "no" to unimportant things' },
  { id: 'daily_review', icon: '📊', label: 'ביקורת יומית/שבועית', labelEn: 'Daily/weekly review' },
  
  // Body & Health
  { id: 'daily_exercise', icon: '💪', label: 'פעילות גופנית יומית', labelEn: 'Daily exercise' },
  { id: 'drinking_water', icon: '💧', label: 'שתיית מים מספקת', labelEn: 'Drinking enough water' },
  { id: 'healthy_eating', icon: '🥗', label: 'תזונה מאוזנת ובריאה', labelEn: 'Balanced healthy eating' },
  { id: 'quality_sleep', icon: '😴', label: 'שינה איכותית ומספקת', labelEn: 'Quality sufficient sleep' },
  { id: 'cold_exposure', icon: '🥶', label: 'מקלחת קרה / אתגר פיזי', labelEn: 'Cold shower / physical challenge' },
  { id: 'medical_checkups', icon: '🏥', label: 'בדיקות רפואיות תקופתיות', labelEn: 'Regular medical checkups' },
  
  // Learning & Development
  { id: 'daily_learning', icon: '📚', label: 'למידה יומית (30+ דקות)', labelEn: 'Daily learning (30+ min)' },
  { id: 'reading', icon: '📖', label: 'קריאת ספרים (לא רשתות)', labelEn: 'Reading books (not social media)' },
  { id: 'podcasts', icon: '🎧', label: 'האזנה לפודקאסטים מלמדים', labelEn: 'Listening to educational podcasts' },
  { id: 'new_language', icon: '🌍', label: 'לימוד שפה חדשה', labelEn: 'Learning a new language' },
  { id: 'courses', icon: '🎓', label: 'קורסים מקצועיים', labelEn: 'Professional courses' },
  
  // Business & Career
  { id: 'work_on_business', icon: '🏗️', label: 'עבודה על הפרויקט/העסק שלי', labelEn: 'Work on my project/business' },
  { id: 'skill_practice', icon: '🎯', label: 'תרגול מיומנות מקצועית', labelEn: 'Professional skill practice' },
  { id: 'networking', icon: '🤝', label: 'נטוורקינג ויצירת קשרים', labelEn: 'Networking & connections' },
  { id: 'client_outreach', icon: '📞', label: 'יצירת קשר עם לקוחות/שותפים', labelEn: 'Reaching out to clients/partners' },
  { id: 'documenting_ideas', icon: '📝', label: 'תיעוד רעיונות ותובנות', labelEn: 'Documenting ideas & insights' },
  
  // Mental & Emotional
  { id: 'meditation', icon: '🧘', label: 'מדיטציה / רפלקציה יומית', labelEn: 'Daily meditation / reflection' },
  { id: 'journaling', icon: '✍️', label: 'כתיבה יומית / ג\'ורנלינג', labelEn: 'Daily journaling' },
  { id: 'gratitude', icon: '🙏', label: 'תרגול הכרת תודה', labelEn: 'Practicing gratitude' },
  { id: 'mental_blocks', icon: '🧠', label: 'עבודה על חסמים מנטליים', labelEn: 'Working on mental blocks' },
  { id: 'stress_management', icon: '💆', label: 'ניהול סטרס בריא', labelEn: 'Healthy stress management' },
  
  // Relationships
  { id: 'family_time', icon: '👨‍👩‍👧', label: 'זמן איכות עם משפחה', labelEn: 'Quality time with family' },
  { id: 'relationship_investment', icon: '💑', label: 'השקעה בזוגיות', labelEn: 'Investing in relationship' },
  { id: 'active_listening', icon: '👂', label: 'הקשבה פעילה לאחרים', labelEn: 'Active listening' },
  { id: 'honest_communication', icon: '💬', label: 'תקשורת כנה ופתוחה', labelEn: 'Honest open communication' },
  { id: 'volunteering', icon: '🤲', label: 'עזרה לאחרים / התנדבות', labelEn: 'Helping others / volunteering' },
  
  // Financial
  { id: 'expense_tracking', icon: '📒', label: 'מעקב הוצאות יומי', labelEn: 'Daily expense tracking' },
  { id: 'regular_saving', icon: '💰', label: 'חיסכון קבוע', labelEn: 'Regular saving' },
  { id: 'learning_investing', icon: '📈', label: 'למידה על השקעות', labelEn: 'Learning about investing' },
  { id: 'additional_income', icon: '💵', label: 'בניית מקור הכנסה נוסף', labelEn: 'Building additional income stream' },
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

// Removed FALLBACK_CAREER_STEPS and FALLBACK_CHALLENGES - user found them not relevant

const STORAGE_KEY = 'launchpad_first_week_progress';

interface SavedProgress {
  selectedQuit: string[];
  selectedBuild: string[];
  selectedCareerStatus: string;
  selectedCareerGoal: string;
}

export function FirstWeekStep({ onComplete, isCompleting, rewards, savedData, onAutoSave }: FirstWeekStepProps) {
  const { language, isRTL } = useTranslation();
  
  // Initialize from savedData (DB) - component will remount on step change due to key
  const getInitialState = (): SavedProgress => {
    // Check savedData from DB first
    if (savedData && (
      (savedData.selectedQuit && savedData.selectedQuit.length > 0) ||
      (savedData.selectedBuild && savedData.selectedBuild.length > 0) ||
      savedData.selectedCareerStatus ||
      savedData.selectedCareerGoal
    )) {
      return {
        selectedQuit: savedData.selectedQuit || [],
        selectedBuild: savedData.selectedBuild || [],
        selectedCareerStatus: savedData.selectedCareerStatus || '',
        selectedCareerGoal: savedData.selectedCareerGoal || '',
      };
    }
    
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as SavedProgress;
      }
    } catch (e) {
      console.error('Error loading saved progress:', e);
    }
    
    return {
      selectedQuit: [],
      selectedBuild: [],
      selectedCareerStatus: '',
      selectedCareerGoal: '',
    };
  };

  const initialState = getInitialState();
  
  // State for selections
  const [selectedQuit, setSelectedQuit] = useState<string[]>(initialState.selectedQuit);
  const [selectedBuild, setSelectedBuild] = useState<string[]>(initialState.selectedBuild);
  const [selectedCareerStatus, setSelectedCareerStatus] = useState<string>(initialState.selectedCareerStatus);
  const [selectedCareerGoal, setSelectedCareerGoal] = useState<string>(initialState.selectedCareerGoal);

  // Current section (for mobile flow)
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3 | 4>(1);

  // Auto-save helper function
  const triggerAutoSave = (updates: Partial<SavedProgress>) => {
    const currentData: SavedProgress = {
      selectedQuit,
      selectedBuild,
      selectedCareerStatus,
      selectedCareerGoal,
      ...updates,
    };
    
    // Save to localStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
    
    // Call onAutoSave for database save
    if (onAutoSave) {
      onAutoSave(currentData);
    }
  };

  const toggleQuit = (label: string) => {
    const newSelected = selectedQuit.includes(label) 
      ? selectedQuit.filter(h => h !== label) 
      : [...selectedQuit, label];
    setSelectedQuit(newSelected);
    triggerAutoSave({ selectedQuit: newSelected });
  };

  const toggleBuild = (label: string) => {
    const newSelected = selectedBuild.includes(label) 
      ? selectedBuild.filter(h => h !== label) 
      : [...selectedBuild, label];
    setSelectedBuild(newSelected);
    triggerAutoSave({ selectedBuild: newSelected });
  };

  const handleCareerStatusSelect = (status: string) => {
    setSelectedCareerStatus(status);
    triggerAutoSave({ selectedCareerStatus: status });
  };

  const handleCareerGoalSelect = (goal: string) => {
    setSelectedCareerGoal(goal);
    triggerAutoSave({ selectedCareerGoal: goal });
  };

  const isValid = 
    selectedQuit.length >= 1 && 
    selectedBuild.length >= 1 && 
    selectedCareerStatus && 
    selectedCareerGoal;

  const handleSubmit = async () => {
    if (isValid) {
      const planData = {
        habits_to_quit: selectedQuit,
        habits_to_build: selectedBuild,
        career_status: selectedCareerStatus,
        career_goal: selectedCareerGoal,
      };

      // Clear localStorage on successful completion
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Error clearing saved progress:', e);
      }
      
      onComplete(planData);
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
                  onClick={() => handleCareerStatusSelect(label)}
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
                  onClick={() => handleCareerGoalSelect(label)}
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
      </motion.div>

      {/* Removed Section 4: Challenge Mission - user found it not relevant */}

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
              ? 'בחר לפחות: הרגל אחד לעזוב, הרגל אחד לבנות, מצב קריירה ומטרה'
              : 'Select at least: 1 habit to quit, 1 to build, career status & goal'
            }
          </p>
        )}
      </div>
    </div>
  );
}

export default FirstWeekStep;
