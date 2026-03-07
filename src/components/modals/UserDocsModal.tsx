import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Compass, MessageCircle, Target, Flame, Brain, Trophy,
  Sparkles, Users, Briefcase, Shield, ArrowLeft, BookOpen
} from 'lucide-react';

interface GuideStep {
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  tip?: string;
  tipHe?: string;
}

interface GuideCard {
  id: string;
  icon: React.ElementType;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  color: string;
  steps: GuideStep[];
}

const GUIDE_CARDS: GuideCard[] = [
  {
    id: 'getting-started',
    icon: Compass,
    titleEn: 'Getting Started',
    titleHe: 'צעדים ראשונים',
    descEn: 'Your first steps on Mind OS',
    descHe: 'הצעדים הראשונים שלך במערכת',
    color: 'from-blue-500/20 to-cyan-500/20',
    steps: [
      {
        title: 'Create Your Account',
        titleHe: 'צור את החשבון שלך',
        description: 'Sign up with your email and verify it. Choose your language preference and set up your profile.',
        descriptionHe: 'הירשם עם האימייל שלך ואמת אותו. בחר את שפת הממשק והגדר את הפרופיל שלך.',
        tip: 'You can switch language anytime from Settings.',
        tipHe: 'ניתן להחליף שפה בכל עת מההגדרות.',
      },
      {
        title: 'Meet Aurora — Your AI Guide',
        titleHe: 'הכר את אורורה — המדריכה שלך',
        description: 'Aurora is your personal AI consciousness coach. She learns from your conversations and adapts to your unique journey.',
        descriptionHe: 'אורורה היא מאמנת התודעה האישית שלך. היא לומדת מהשיחות שלך ומתאימה את עצמה למסע הייחודי שלך.',
        tip: 'The more you share with Aurora, the more personalized your experience becomes.',
        tipHe: 'ככל שתשתף יותר עם אורורה, כך החוויה תהיה מותאמת אישית יותר.',
      },
      {
        title: 'Complete Your Assessment',
        titleHe: 'השלם את האבחון שלך',
        description: 'Take the initial consciousness assessment to calibrate your starting point and unlock personalized recommendations.',
        descriptionHe: 'בצע את אבחון התודעה הראשוני כדי לכייל את נקודת ההתחלה שלך ולפתוח המלצות מותאמות אישית.',
      },
    ],
  },
  {
    id: 'aurora-chat',
    icon: MessageCircle,
    titleEn: 'Chatting with Aurora',
    titleHe: 'שיחה עם אורורה',
    descEn: 'How to get the most from your AI coach',
    descHe: 'איך להפיק את המרב מהמאמנת שלך',
    color: 'from-violet-500/20 to-purple-500/20',
    steps: [
      {
        title: 'Start a Conversation',
        titleHe: 'התחל שיחה',
        description: 'Open the chat from the dashboard or bottom nav. Aurora remembers your previous conversations and context.',
        descriptionHe: 'פתח את הצ\'אט מהדאשבורד או מהניווט התחתון. אורורה זוכרת את השיחות הקודמות והקונטקסט שלך.',
      },
      {
        title: 'Ask for Guidance',
        titleHe: 'בקש הדרכה',
        description: 'You can ask about your life plan, get motivation, discuss challenges, or explore consciousness concepts.',
        descriptionHe: 'תוכל לשאול על תוכנית החיים שלך, לקבל מוטיבציה, לדון באתגרים, או לחקור מושגי תודעה.',
        tip: 'Try asking: "What should I focus on today?" or "Help me reflect on my week."',
        tipHe: 'נסה לשאול: "על מה כדאי לי להתמקד היום?" או "עזור לי לעשות רפלקציה על השבוע".',
      },
      {
        title: 'Voice & Hypnosis Modes',
        titleHe: 'מצב קולי והיפנוזה',
        description: 'Activate voice mode for hands-free conversations. Use hypnosis mode for guided meditation and deep-state sessions.',
        descriptionHe: 'הפעל מצב קולי לשיחות ללא ידיים. השתמש במצב היפנוזה למדיטציות מודרכות ולסשנים של מצב עמוק.',
      },
    ],
  },
  {
    id: 'action-items',
    icon: Target,
    titleEn: 'Action Items & Tasks',
    titleHe: 'פריטי פעולה ומשימות',
    descEn: 'Managing your daily growth actions',
    descHe: 'ניהול פעולות הצמיחה היומיות שלך',
    color: 'from-emerald-500/20 to-green-500/20',
    steps: [
      {
        title: 'Your Today View',
        titleHe: 'תצוגת היום שלך',
        description: 'The Today page shows your prioritized actions, habits, and milestones for the day. Complete them to earn XP and tokens.',
        descriptionHe: 'עמוד היום מציג את הפעולות, ההרגלים ואבני הדרך שלך לפי עדיפות. השלם אותם כדי לצבור XP ואסימונים.',
      },
      {
        title: 'Create & Customize Actions',
        titleHe: 'צור והתאם אישית פעולות',
        description: 'Add new actions manually or let Aurora suggest them based on your life plan. Set priorities, time blocks, and recurrence.',
        descriptionHe: 'הוסף פעולות חדשות ידנית או תן לאורורה להציע אותן על בסיס תוכנית החיים שלך. הגדר עדיפויות, בלוקים ומחזוריות.',
      },
      {
        title: 'Track Your Streaks',
        titleHe: 'עקוב אחרי הרצפים שלך',
        description: 'Build consistency with streak tracking. The longer your streak, the more bonus rewards you earn.',
        descriptionHe: 'בנה עקביות עם מעקב רצפים. ככל שהרצף ארוך יותר, כך תרוויח בונוסים גדולים יותר.',
      },
    ],
  },
  {
    id: 'life-plan',
    icon: Flame,
    titleEn: 'Life Plan & Vision',
    titleHe: 'תוכנית חיים וחזון',
    descEn: 'Build and follow your personal roadmap',
    descHe: 'בנה ועקוב אחרי מפת הדרכים האישית שלך',
    color: 'from-orange-500/20 to-amber-500/20',
    steps: [
      {
        title: 'Discover Your Why',
        titleHe: 'גלה את ה"למה" שלך',
        description: 'Aurora helps you explore your core values, vision, and life direction through guided conversations using the Why-How-Now methodology.',
        descriptionHe: 'אורורה עוזרת לך לחקור את הערכים, החזון וכיוון החיים שלך דרך שיחות מודרכות בשיטת Why-How-Now.',
      },
      {
        title: 'Set Milestones',
        titleHe: 'הגדר אבני דרך',
        description: 'Break your vision into achievable milestones. Each milestone contains specific actions and has token rewards.',
        descriptionHe: 'פרק את החזון שלך לאבני דרך בר-השגה. כל אבן דרך מכילה פעולות ספציפיות ותגמולי אסימונים.',
      },
      {
        title: 'Review & Adapt',
        titleHe: 'סקור והתאם',
        description: 'Regularly review your progress with Aurora. Your plan evolves as you grow — it\'s a living document.',
        descriptionHe: 'סקור את ההתקדמות שלך עם אורורה באופן קבוע. התוכנית מתפתחת ככל שאתה גדל — זה מסמך חי.',
      },
    ],
  },
  {
    id: 'orb-system',
    icon: Sparkles,
    titleEn: 'Your Orb & NFT',
    titleHe: 'האורב וה-NFT שלך',
    descEn: 'Understanding your digital consciousness avatar',
    descHe: 'הבנת האווטאר הדיגיטלי שלך',
    color: 'from-fuchsia-500/20 to-pink-500/20',
    steps: [
      {
        title: 'What is the Orb?',
        titleHe: 'מהו האורב?',
        description: 'Your Orb is a living, dynamic 3D avatar that reflects your consciousness journey. Its colors, shape, and energy evolve as you grow.',
        descriptionHe: 'האורב שלך הוא אווטאר תלת-ממדי חי ודינמי שמשקף את מסע התודעה שלך. הצבעים, הצורה והאנרגיה שלו מתפתחים ככל שאתה גדל.',
      },
      {
        title: 'Orb DNA Card',
        titleHe: 'כרטיס DNA של האורב',
        description: 'Click your Orb to view its DNA card — a unique NFT-style identity card showing your stats, traits, and consciousness level.',
        descriptionHe: 'לחץ על האורב כדי לצפות בכרטיס ה-DNA שלו — כרטיס זהות ייחודי בסגנון NFT שמציג את הנתונים, התכונות ורמת התודעה שלך.',
      },
      {
        title: 'Evolve Your Orb',
        titleHe: 'פתח את האורב שלך',
        description: 'Complete actions, maintain streaks, and level up to unlock new Orb forms, particle effects, and visual enhancements.',
        descriptionHe: 'השלם פעולות, שמור על רצפים ועלה רמה כדי לפתוח צורות אורב חדשות, אפקטים ושיפורים חזותיים.',
      },
    ],
  },
  {
    id: 'gamification',
    icon: Trophy,
    titleEn: 'XP, Tokens & Rewards',
    titleHe: 'XP, אסימונים ותגמולים',
    descEn: 'The Play2Earn consciousness economy',
    descHe: 'כלכלת התודעה Play2Earn',
    color: 'from-yellow-500/20 to-amber-500/20',
    steps: [
      {
        title: 'Earning XP',
        titleHe: 'צבירת XP',
        description: 'Gain XP by completing actions, maintaining streaks, and engaging with Aurora. XP determines your level and unlocks new features.',
        descriptionHe: 'צבור XP על ידי השלמת פעולות, שמירה על רצפים ומעורבות עם אורורה. XP קובע את הרמה שלך ופותח תכונות חדשות.',
      },
      {
        title: 'MOS Tokens',
        titleHe: 'אסימוני MOS',
        description: 'Earn MOS tokens through milestone completions and achievements. Tokens can be used in the Free Market for digital products and services.',
        descriptionHe: 'הרוויח אסימוני MOS דרך השלמת אבני דרך והישגים. ניתן להשתמש באסימונים בשוק החופשי למוצרים ושירותים דיגיטליים.',
      },
      {
        title: 'Achievements & Badges',
        titleHe: 'הישגים ותגים',
        description: 'Unlock achievements for special milestones. Collect badges to showcase your growth journey on your profile.',
        descriptionHe: 'פתח הישגים עבור אבני דרך מיוחדות. אסוף תגים להצגת מסע הצמיחה שלך בפרופיל.',
      },
    ],
  },
  {
    id: 'skills',
    icon: Brain,
    titleEn: 'Skills & Growth',
    titleHe: 'מיומנויות וצמיחה',
    descEn: 'Track and develop your consciousness skills',
    descHe: 'עקוב ופתח את מיומנויות התודעה שלך',
    color: 'from-teal-500/20 to-cyan-500/20',
    steps: [
      {
        title: 'Skill Tree',
        titleHe: 'עץ מיומנויות',
        description: 'View your skills across pillars: Mind, Body, Spirit, Social, and Career. Each action you complete contributes to specific skills.',
        descriptionHe: 'צפה במיומנויות שלך על פני עמודים: נפש, גוף, רוח, חברה וקריירה. כל פעולה שתשלים תורמת למיומנויות ספציפיות.',
      },
      {
        title: 'Level Up Skills',
        titleHe: 'שדרג מיומנויות',
        description: 'Focus on specific areas to accelerate growth. Aurora will suggest actions aligned with the skills you want to develop.',
        descriptionHe: 'התמקד באזורים ספציפיים כדי להאיץ את הצמיחה. אורורה תציע פעולות מותאמות למיומנויות שתרצה לפתח.',
      },
    ],
  },
  {
    id: 'community',
    icon: Users,
    titleEn: 'Community',
    titleHe: 'קהילה',
    descEn: 'Connect with fellow consciousness explorers',
    descHe: 'התחבר לחוקרי תודעה אחרים',
    color: 'from-indigo-500/20 to-blue-500/20',
    steps: [
      {
        title: 'Join the Community',
        titleHe: 'הצטרף לקהילה',
        description: 'Share insights, ask questions, and support others on their journey. Post in topic-based categories.',
        descriptionHe: 'שתף תובנות, שאל שאלות ותמוך באחרים במסע שלהם. פרסם בקטגוריות על פי נושא.',
      },
      {
        title: 'Events & Challenges',
        titleHe: 'אירועים ואתגרים',
        description: 'Participate in community events, group challenges, and live sessions with coaches.',
        descriptionHe: 'השתתף באירועי קהילה, אתגרים קבוצתיים וסשנים חיים עם מאמנים.',
      },
    ],
  },
  {
    id: 'coaching',
    icon: Briefcase,
    titleEn: 'For Coaches',
    titleHe: 'למאמנים',
    descEn: 'Tools for consciousness coaches',
    descHe: 'כלים למאמני תודעה',
    color: 'from-rose-500/20 to-red-500/20',
    steps: [
      {
        title: 'Set Up Your Practice',
        titleHe: 'הקם את הפרקטיקה שלך',
        description: 'Create your coaching profile, define services, set availability, and build your landing page.',
        descriptionHe: 'צור את פרופיל האימון שלך, הגדר שירותים, קבע זמינות ובנה את דף הנחיתה שלך.',
      },
      {
        title: 'Manage Clients',
        titleHe: 'נהל לקוחות',
        description: 'Use client plans, track progress, and leverage AI-assisted session notes for each client.',
        descriptionHe: 'השתמש בתוכניות לקוח, עקוב אחרי התקדמות ונצל תיעוד סשנים בסיוע AI לכל לקוח.',
      },
      {
        title: 'Free Market Store',
        titleHe: 'חנות השוק החופשי',
        description: 'Sell digital products, courses, and services in the Free Market. Accept both regular payments and MOS tokens.',
        descriptionHe: 'מכור מוצרים דיגיטליים, קורסים ושירותים בשוק החופשי. קבל תשלומים רגילים ואסימוני MOS.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: Shield,
    titleEn: 'Privacy & Security',
    titleHe: 'פרטיות ואבטחה',
    descEn: 'How we protect your data',
    descHe: 'איך אנחנו מגנים על המידע שלך',
    color: 'from-slate-500/20 to-gray-500/20',
    steps: [
      {
        title: 'Your Data is Yours',
        titleHe: 'המידע שלך הוא שלך',
        description: 'All conversations with Aurora are encrypted and private. We never sell or share your personal data.',
        descriptionHe: 'כל השיחות עם אורורה מוצפנות ופרטיות. אנחנו אף פעם לא מוכרים או משתפים את המידע האישי שלך.',
      },
      {
        title: 'Control Your Account',
        titleHe: 'שלוט בחשבון שלך',
        description: 'Manage your settings, export your data, or delete your account at any time from the Settings page.',
        descriptionHe: 'נהל את ההגדרות שלך, ייצא את המידע שלך, או מחק את חשבונך בכל עת מעמוד ההגדרות.',
      },
    ],
  },
];

interface UserDocsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDocsModal({ open, onOpenChange }: UserDocsModalProps) {
  const { language, isRTL } = useTranslation();
  const [selectedGuide, setSelectedGuide] = useState<GuideCard | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setSelectedGuide(null);
    setCurrentStep(0);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setSelectedGuide(null);
      setCurrentStep(0);
    }
  };

  const handleNext = () => {
    if (selectedGuide && currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); onOpenChange(val); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader
          title={
            selectedGuide
              ? (isRTL ? selectedGuide.titleHe : selectedGuide.titleEn)
              : (isRTL ? 'מדריך למשתמש' : 'User Guide')
          }
          icon={selectedGuide ? <selectedGuide.icon className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          showBackArrow={!!selectedGuide}
          onBack={handleBack}
          className="px-6 pt-6"
        />

        <ScrollArea className="flex-1 max-h-[calc(85vh-5rem)]">
          <div className="p-6">
            {!selectedGuide ? (
              // Card Grid View
              <div className="grid grid-cols-2 gap-3">
                {GUIDE_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedGuide(card); setCurrentStep(0); }}
                      className={cn(
                        "group relative flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50",
                        "bg-gradient-to-br", card.color,
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                        "transition-all duration-200 text-start"
                      )}
                    >
                      <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">
                          {isRTL ? card.titleHe : card.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {isRTL ? card.descHe : card.descEn}
                        </p>
                      </div>
                      <div className="absolute top-3 end-3 text-[10px] text-muted-foreground/60 font-medium">
                        {card.steps.length} {isRTL ? 'שלבים' : 'steps'}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Step Walkthrough View
              <div className="space-y-6">
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2">
                  {selectedGuide.steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        idx === currentStep
                          ? "w-8 bg-primary"
                          : idx < currentStep
                            ? "w-2 bg-primary/40"
                            : "w-2 bg-muted-foreground/20"
                      )}
                    />
                  ))}
                </div>

                {/* Step content */}
                {(() => {
                  const step = selectedGuide.steps[currentStep];
                  return (
                    <div className="space-y-4 animate-in fade-in-0 slide-in-from-end-4 duration-300">
                      <div className="text-center">
                        <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                          {isRTL ? `שלב ${currentStep + 1} מתוך ${selectedGuide.steps.length}` : `Step ${currentStep + 1} of ${selectedGuide.steps.length}`}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-center text-foreground">
                        {isRTL ? step.titleHe : step.title}
                      </h3>

                      <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-md mx-auto">
                        {isRTL ? step.descriptionHe : step.description}
                      </p>

                      {(step.tip || step.tipHe) && (
                        <div className="mx-auto max-w-md p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-primary flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>{isRTL ? step.tipHe : step.tip}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {currentStep === 0
                      ? (isRTL ? '← חזרה לתפריט' : '← Back to menu')
                      : (isRTL ? '← הקודם' : '← Previous')
                    }
                  </button>

                  {currentStep < selectedGuide.steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {isRTL ? 'הבא →' : 'Next →'}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelectedGuide(null); setCurrentStep(0); }}
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {isRTL ? 'סיום ✓' : 'Done ✓'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
