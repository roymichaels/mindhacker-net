import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, Brain, Target, Users, Sparkles, Shield, Rocket, BarChart3, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Documentation() {
  const { language, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const navigate = useNavigate();
  const he = language === 'he';

  const brandName = he ? theme.brand_name : theme.brand_name_en;
  const founderName = he ? theme.founder_name : theme.founder_name_en;

  const sections = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: he ? 'מה זה ' + brandName + '?' : `What is ${brandName}?`,
      content: he
        ? `${brandName} הוא מערכת הפעלה אישית חכמה שעוטפת את חייך ועוזרת לך לנהל אותם. היא משלבת בינה מלאכותית, גיימיפיקציה, וכלים לפיתוח אישי לתוך פלטפורמה אחת שמלווה אותך בכל רגע — מהבוקר ועד הלילה.`
        : `${brandName} is an intelligent personal operating system that wraps around your entire life and helps you operate it. It combines AI, gamification, and personal development tools into a single platform that accompanies you from morning to night.`,
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: he ? 'החזון' : 'The Vision',
      content: he
        ? `לבנות את מערכת ההפעלה הראשונה בעולם שמנהלת חיים אנושיים. לא עוד אפליקציה — אלא שכבה חכמה שיושבת מעל הכל: הבריאות שלך, הקריירה, הזוגיות, הכסף, ההרגלים, והתודעה. הכל מקום אחד, עם AI שמכיר אותך באמת.`
        : `To build the world's first operating system that manages human life. Not another app — but an intelligent layer that sits above everything: your health, career, relationships, finances, habits, and consciousness. All in one place, with an AI that truly knows you.`,
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: he ? 'Aurora — הליבה האינטליגנטית' : 'Aurora — The Intelligent Core',
      content: he
        ? `Aurora היא ה-AI האישי שלך. היא לא רק צ'אטבוט — היא מנוע תודעתי שלומד את הדפוסים שלך, מזהה את נקודות החוזק והחולשה, ויוצרת תוכניות פעולה מותאמות אישית. Aurora מנהלת לך את היום, מזכירה, מניעה, ודוחפת אותך קדימה.`
        : `Aurora is your personal AI. Not just a chatbot — it's a consciousness engine that learns your patterns, identifies strengths and weaknesses, and creates personalized action plans. Aurora manages your day, reminds, motivates, and pushes you forward.`,
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: he ? 'ארכיטקטורת המערכת' : 'System Architecture',
      subsections: [
        {
          label: he ? 'עכשיו (Now)' : 'Now Hub',
          desc: he ? 'הדשבורד המרכזי — משימות, הרגלים, אנרגיה, וסטטוס יומי.' : 'Central dashboard — tasks, habits, energy, daily status.',
        },
        {
          label: he ? 'טקטיקות (Tactics)' : 'Tactics Hub',
          desc: he ? 'ניהול משימות, פרויקטים, ו-sprints לביצוע.' : 'Task management, projects, and execution sprints.',
        },
        {
          label: he ? 'אסטרטגיה (Strategy)' : 'Strategy Hub',
          desc: he ? '14 עמודי חיים, תכונות אופי, משימות חיים, וסריקות עומק.' : '14 life pillars, character traits, life missions, and deep scans.',
        },
        {
          label: he ? 'קהילה (Community)' : 'Community Hub',
          desc: he ? 'פיד קהילתי, אירועים, דירוגים, ותמיכה הדדית.' : 'Community feed, events, leaderboards, and mutual support.',
        },
        {
          label: he ? 'למידה (Learn)' : 'Learn Hub',
          desc: he ? 'קורסים, מסעות, ותוכן מותאם אישית.' : 'Courses, journeys, and personalized content.',
        },
      ],
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: he ? 'מערכת הגיימיפיקציה' : 'Gamification Engine',
      content: he
        ? `כל פעולה שאתה עושה מניבה XP, טוקנים, ו-streak. אתה עולה רמות, פותח תכונות אופי חדשות, ומגלה את ה"פרופיל דמות" שלך — ייצוג ויזואלי של מי שאתה הופך להיות. ה-Orb שלך משתנה בהתאם להתקדמות שלך.`
        : `Every action earns XP, tokens, and streaks. You level up, unlock character traits, and discover your "character profile" — a visual representation of who you're becoming. Your Orb evolves based on your progress.`,
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: he ? '14 עמודי החיים' : 'The 14 Life Pillars',
      content: he
        ? `המערכת מנתחת את חייך דרך 14 ממדים: נוכחות, כוח, חיוניות, פוקוס, לחימה, התרחבות, תודעה, עושר, השפעה, מערכות יחסים, עסקים, פרויקטים, משחק, ועוד. כל ממד נסרק, מנותח, ומקבל ציון + תוכנית שיפור.`
        : `The system analyzes your life through 14 dimensions: Presence, Power, Vitality, Focus, Combat, Expansion, Consciousness, Wealth, Influence, Relationships, Business, Projects, Play, and more. Each dimension is scanned, analyzed, and given a score + improvement plan.`,
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: he ? 'מודל עסקי' : 'Business Model',
      content: he
        ? `פרימיום — גרסה חינמית עם סריקה אחת + גישה ל-Aurora. מנוי חודשי פותח סריקות ללא הגבלה, תוכניות AI, קהילה, קורסים, ומאמנים. FreeMarket — שוק פנימי שבו משתמשים יכולים לקנות ולמכור שירותים ומוצרים.`
        : `Freemium — free tier with one scan + Aurora access. Monthly subscription unlocks unlimited scans, AI plans, community, courses, and coaches. FreeMarket — an internal marketplace where users buy and sell services and products.`,
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: he ? 'למה עכשיו?' : 'Why Now?',
      content: he
        ? `AI הגיע לרמה שמאפשרת אינטראקציה אישית אמיתית. אנשים מרגישים אבודים, מוצפים, וחסרי כיוון. אין מערכת אחת שעוטפת את כל החיים. ${brandName} הוא התשובה — מערכת הפעלה אנושית שמנהלת הכל.`
        : `AI has reached a level enabling true personal interaction. People feel lost, overwhelmed, and directionless. No single system wraps around all of life. ${brandName} is the answer — a human operating system that manages everything.`,
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: he ? 'היתרון התחרותי' : 'Competitive Advantage',
      content: he
        ? `1) AI תודעתי (Aurora) שמכיר אותך באמת. 2) 14 עמודי חיים — לא רק פרודוקטיביות. 3) גיימיפיקציה עמוקה עם Orb מתפתח. 4) FreeMarket פנימי. 5) פלטפורמה למאמנים שמגדילה retention. 6) תשתית white-label למותגים.`
        : `1) Consciousness AI (Aurora) that truly knows you. 2) 14 life pillars — not just productivity. 3) Deep gamification with evolving Orb. 4) Internal FreeMarket. 5) Coach platform that increases retention. 6) White-label infrastructure for brands.`,
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: he ? 'טכנולוגיה' : 'Technology Stack',
      content: he
        ? `React + TypeScript frontend, Supabase backend (auth, DB, edge functions, storage), AI models (Gemini, GPT), PWA support, Three.js Orb rendering, real-time subscriptions, multi-language (HE/EN), dark/light themes, responsive design.`
        : `React + TypeScript frontend, Supabase backend (auth, DB, edge functions, storage), AI models (Gemini, GPT), PWA support, Three.js Orb rendering, real-time subscriptions, multi-language (HE/EN), dark/light themes, responsive design.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <AuroraOrbIcon className="w-7 h-7 text-foreground" size={28} />
          <span className="font-bold text-foreground text-sm">{brandName}</span>
          <span className="text-muted-foreground text-sm">—</span>
          <span className="text-muted-foreground text-sm">{he ? 'ווייטפייפר' : 'White Paper'}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 pb-8 border-b border-border"
        >
          <div className="flex justify-center">
            <AuroraOrbIcon className="w-20 h-20 text-primary" size={80} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
            {brandName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {he
              ? 'מערכת ההפעלה האישית הראשונה בעולם — ווייטפייפר'
              : "The World's First Personal Operating System — White Paper"
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {he ? `מאת ${founderName}` : `By ${founderName}`} · {theme.company_legal_name} · {new Date().getFullYear()}
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((section, i) => (
          <motion.section
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className="rounded-xl border border-border bg-card/50 p-6 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
            </div>

            {section.content && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            )}

            {section.subsections && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {section.subsections.map((sub, j) => (
                  <div key={j} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{sub.label}</p>
                    <p className="text-xs text-muted-foreground">{sub.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        ))}

        {/* Footer */}
        <div className="text-center pt-8 pb-20 border-t border-border space-y-2">
          <p className="text-sm text-muted-foreground">
            {he ? `© ${new Date().getFullYear()} ${theme.company_legal_name}. כל הזכויות שמורות.` : `© ${new Date().getFullYear()} ${theme.company_legal_name}. All rights reserved.`}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {he ? 'מסמך חסוי — לשימוש פנימי בלבד' : 'Confidential Document — Internal Use Only'}
          </p>
        </div>
      </div>
    </div>
  );
}
