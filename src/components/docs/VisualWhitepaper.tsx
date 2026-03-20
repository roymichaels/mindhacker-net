import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { VisualWhitepaperScene } from './visual/VisualWhitepaperScene';
import { VisualSection } from './visual/VisualSection';
import { WhitepaperOrb } from './visual/WhitepaperOrb';
import { StatCard } from './visual/StatCard';
import { FeatureNode } from './visual/FeatureNode';
import { RoadmapTimeline } from './visual/RoadmapTimeline';
import { cn } from '@/lib/utils';

interface Props {
  onExit: () => void;
}

export function VisualWhitepaper({ onExit }: Props) {
  const { language } = useTranslation();
  const { theme } = useThemeSettings();
  const he = language === 'he';
  const brandName = he ? theme.brand_name : theme.brand_name_en;
  const founderName = he ? theme.founder_name : theme.founder_name_en;
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const totalSlides = 22;

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= totalSlides || isScrolling.current) return;
    isScrolling.current = true;
    setCurrent(idx);
    setTimeout(() => { isScrolling.current = false; }, 800);
  }, [totalSlides]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, goTo, onExit]);

  // Wheel
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 30) return;
      if (e.deltaY > 0) goTo(current + 1);
      else goTo(current - 1);
    };
    const el = containerRef.current;
    if (el) el.addEventListener('wheel', handler, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', handler); };
  }, [current, goTo]);

  // Touch
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return;
      if (diff > 0) goTo(current + 1); else goTo(current - 1);
    };
    const el = containerRef.current;
    if (el) { el.addEventListener('touchstart', onStart); el.addEventListener('touchend', onEnd); }
    return () => { if (el) { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd); } };
  }, [current, goTo]);

  const scrollProgress = totalSlides > 1 ? current / (totalSlides - 1) : 0;

  const t = (en: string, heTxt: string) => he ? heTxt : en;

  const renderSlideContent = () => {
    switch (current) {
      case 0: // Hero
        return (
          <VisualSection index={0} isActive title={brandName || 'MindOS'} subtitle={t('The First AI-Powered Human Operating System', 'מערכת ההפעלה האנושית הראשונה מבוססת AI')} isHe={he} layout="center">
            <div className="flex justify-center pt-4">
              <WhitepaperOrb size={180} />
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              <StatCard value={5} label={t('Core Experiences', 'חוויות ליבה')} delay={0} color="hsl(271 81% 55%)" />
              <StatCard value={100} suffix="%" label={t('AI-Powered', 'מבוסס AI')} delay={0.1} color="hsl(187 85% 50%)" />
              <StatCard value={15} label={t('Life Pillars', 'עמודי חיים')} delay={0.2} color="hsl(45 90% 55%)" />
            </div>
          </VisualSection>
        );

      case 1: // Introduction
        return (
          <VisualSection index={1} isActive number="01" title={t('Introduction', 'מבוא')} subtitle={t('Not another app — the operating system of your life.', 'לא עוד אפליקציה — מערכת ההפעלה של החיים שלך.')} isHe={he} layout="center" accent="hsl(271 81% 55%)">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🔗', title: t('One Intelligent Layer', 'שכבה אינטליגנטית אחת'), desc: t('Above all life domains — health, career, relationships, finances.', 'מעל כל תחומי החיים — בריאות, קריירה, זוגיות, כסף.') },
                { icon: '🤖', title: t('Adaptive Consciousness AI', 'AI תודעתי אדפטיבי'), desc: t('An AI engine that evolves and learns you over time.', 'מנוע בינה מלאכותית שמתפתח ולומד אותך לאורך זמן.') },
                { icon: '🌐', title: t('Proof of Growth Economy', 'כלכלת Proof of Growth'), desc: t('Digital ownership, rewards, and decentralized marketplace.', 'בעלות דיגיטלית, תגמולים, ושוק חופשי מבוזר.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(271 81% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 2: // Problem
        return (
          <VisualSection index={2} isActive number="02" title={t('The Problem', 'הבעיה')} isHe={he} layout="center" accent="hsl(0 75% 55%)">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '📱', title: t('80+ Apps Installed', '80+ אפליקציות'), desc: t('Average user installs 80+ apps and uses 9 daily.', 'המשתמש הממוצע מתקין 80+ אפליקציות ומשתמש ב-9 ביום.') },
                { icon: '🧠', title: t('Cognitive Fragmentation', 'פיצול קוגניטיבי'), desc: t('Information scattered across dozens of disconnected tools.', 'מידע מפוזר בין עשרות כלים מנותקים.') },
                { icon: '😩', title: t('Digital Overwhelm', 'עומס דיגיטלי'), desc: t('Lost control, burnout, no direction, wasted personal data.', 'חוסר שליטה, שחיקה, חוסר כיוון, ובזבוז נתונים אישיים.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(0 75% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 3: // Why-How-Now Methodology
        return (
          <VisualSection index={3} isActive number="03" title={t('Why-How-Now Methodology', 'מתודולוגיית Why-How-Now')} subtitle={t('Three horizons from vision to daily action.', 'שלושה אופקים מחזון לפעולה יומית.')} isHe={he} layout="center" accent="hsl(45 90% 55%)">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🎯', title: t('Strategy (Why)', 'אסטרטגיה (Why)'), desc: t('Life goals, values, missions, and 15 life pillars. Your north star.', 'מטרות חיים, ערכים, משימות, ו-15 עמודי חיים. הצפון שלך.'), color: 'hsl(271 81% 55%)' },
                { icon: '🗺️', title: t('Tactics (How)', 'טקטיקה (How)'), desc: t('100-day plan with phases, milestones, and daily action blocks.', 'תוכנית 100 ימים עם שלבים, אבני דרך, ובלוקי פעולה יומיים.'), color: 'hsl(187 85% 50%)' },
                { icon: '⚡', title: t('Now (Execute)', 'עכשיו (Execute)'), desc: t('Daily dashboard with 4 adventure-themed quarters, Movement Score, and Quest system.', 'דשבורד יומי עם 4 רבעוני הרפתקה, Movement Score, ומערכת Quest.'), color: 'hsl(45 90% 55%)' },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color={item.color} />
              ))}
            </div>
          </VisualSection>
        );

      case 4: // Five Core Experiences
        return (
          <VisualSection index={4} isActive number="04" title={t('Five Core Experiences', 'חמש חוויות ליבה')} isHe={he} layout="center" accent="hsl(45 90% 55%)">
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🎮', title: 'Play', desc: t('Unified execution hub with 100-day plans', 'מרכז ביצוע מאוחד עם תוכנית 100 ימים'), color: 'hsl(271 81% 55%)' },
                { icon: '🧠', title: 'Aurora', desc: t('Adaptive consciousness AI engine', 'מנוע AI תודעתי אדפטיבי'), color: 'hsl(187 85% 50%)' },
                { icon: '🏪', title: 'FreeMarket', desc: t('Marketplace & Earn economy', 'שוק חופשי וכלכלת Earn'), color: 'hsl(45 90% 55%)' },
                { icon: '👥', title: 'Community', desc: t('Social feed & level system', 'פיד חברתי ומערכת רמות'), color: 'hsl(168 70% 50%)' },
                { icon: '📚', title: 'Learn', desc: t('AI-powered adaptive learning', 'למידה אדפטיבית מבוססת AI'), color: 'hsl(320 80% 55%)' },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.4 + i * 0.1} color={item.color} />
              ))}
            </div>
          </VisualSection>
        );

      case 5: // Aurora Deep Dive
        return (
          <VisualSection index={5} isActive number="05" title={t('Aurora — Consciousness AI', 'Aurora — מנוע ה-AI התודעתי')} subtitle={t('Not a chatbot — a consciousness engine that evolves with you.', 'לא צ\'אטבוט — מנוע תודעתי שמתפתח איתך.')} isHe={he} layout="center" accent="hsl(271 81% 55%)">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🔮', title: t('Full Context Awareness', 'מודעות הקשרית מלאה'), desc: t('7+ data sources: profile, plans, schedule, pillar scores, emotional state.', '7+ מקורות: פרופיל, תוכניות, לו"ז, ציוני עמודים, מצב רגשי.') },
                { icon: '📊', title: t('Memory Graph', 'גרף זיכרון'), desc: t('Dynamic profile of identity, preferences, patterns — cross-conversation insights.', 'פרופיל דינמי של זהות, העדפות, דפוסים — תובנות חוצות-שיחות.') },
                { icon: '🎤', title: t('Voice Mode', 'מצב קולי'), desc: t('Bidirectional voice with live Orb animation and multimodal processing.', 'קולי דו-כיווני עם אנימציית Orb חיה ועיבוד מולטימודלי.') },
                { icon: '⚡', title: t('Proactive Engine', 'מנוע פרואקטיבי'), desc: t('Context-based nudges, reminders, streak warnings, and action suggestions.', 'דחיפות מבוססות הקשר, תזכורות, אזהרות streak, והצעות פעולה.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(271 81% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 6: // Hypnosis & Meditation
        return (
          <VisualSection index={6} isActive number="06" title={t('AI-Guided Hypnosis & Meditation', 'היפנוזה ומדיטציה מונחית AI')} isHe={he} layout="center" accent="hsl(280 70% 50%)">
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '🌀', title: t('Personalized Scripts', 'תסריטים מותאמים'), desc: t('Real-time generated based on your profile, goals, and consciousness patterns.', 'נוצרים בזמן אמת על בסיס פרופיל, מטרות, ודפוסי תודעה.') },
                { icon: '🎵', title: t('Binaural Frequencies', 'תדרים בינאורליים'), desc: t('Background music and frequency layers for deep immersion.', 'מוזיקת רקע ושכבות תדר לשקיעה עמוקה.') },
                { icon: '🧘', title: t('Ego State Work', 'עבודה עם מצבי אגו'), desc: t('Subconscious work, visualization, and affirmation practice.', 'עבודה עם תת-מודע, ויזואליזציה ואפירמציות.') },
                { icon: '💰', title: t('Earn MOS', 'הרוויח MOS'), desc: t('Every session rewards MOS and affects your Consciousness Pillar score.', 'כל סשן מתגמל MOS ומשפיע על ציון עמוד התודעה.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(280 70% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 7: // AION Identity
        return (
          <VisualSection index={7} isActive number="07" title={t('AION — Digital Identity', 'AION — זהות דיגיטלית')} subtitle={t('Your evolving digital identity.', 'הזהות הדיגיטלית המתפתחת שלך.')} isHe={he} layout="center" accent="hsl(320 80% 55%)">
            <div className="flex justify-center py-2">
              <WhitepaperOrb size={120} />
            </div>
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '🎨', title: t('Dynamic Visuals', 'ויזואל דינמי'), desc: t('Colors shift by dominant pillars. Morphology grows with level.', 'צבעים משתנים לפי עמודים. המורפולוגיה גדלה עם הרמה.') },
                { icon: '✨', title: t('Particles & Bloom', 'חלקיקים והילה'), desc: t('Density by streak. Bloom reflects consciousness depth.', 'צפיפות לפי streak. Bloom משקף עומק התודעה.') },
                { icon: '🔐', title: t('Web3 Wallet', 'ארנק Web3'), desc: t('No seed phrases — sign in with Google/Email. True digital ownership.', 'ללא seed phrases — כניסה דרך Google/Email. בעלות דיגיטלית אמיתית.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(320 80% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 8: // Digital Economy
        return (
          <VisualSection index={8} isActive number="08" title={t('MOS Economy — Proof of Growth', 'כלכלת MOS — Proof of Growth')} isHe={he} layout="center" accent="hsl(45 90% 55%)">
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <StatCard value={100} suffix=" MOS" label="= $1.00" delay={0} color="hsl(45 90% 55%)" />
              <StatCard value={200} label={t('Daily Cap', 'תקרה יומית')} delay={0.1} color="hsl(271 81% 55%)" />
              <StatCard value={2} suffix="%" label={t('Platform Fee', 'עמלת פלטפורמה')} delay={0.2} color="hsl(168 70% 50%)" />
            </div>
            <div className="grid gap-3 max-w-xl mx-auto pt-4">
              {[
                { icon: '⛏️', title: t('Mining Engine', 'מנוע כרייה'), desc: t('Auto-rewards: Hypnosis 10, Posts 8, Lessons 5, Habits 3 MOS.', 'תגמול אוטומטי: היפנוזה 10, פוסטים 8, שיעורים 5, הרגלים 3 MOS.') },
                { icon: '📊', title: t('Data Marketplace', 'שוק נתונים'), desc: t('80/20 revenue split on anonymized insights. User-controlled opt-in.', 'חלוקה 80/20 על תובנות אנונימיות. הסכמה גרנולרית.') },
                { icon: '💼', title: t('Wallet & Settlement', 'ארנק ויישוב'), desc: t('Global wallet modal with vMOS balance, history, and fee breakdown.', 'ארנק גלובלי עם יתרת vMOS, היסטוריה, ופירוט עמלות.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.6 + i * 0.1} color="hsl(45 90% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 9: // Play2Earn
        return (
          <VisualSection index={9} isActive number="09" title={t('Play2Earn — Earn From Every Action', 'Play2Earn — הרוויח מכל פעולה')} isHe={he} layout="center" accent="hsl(168 70% 45%)">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🌱', title: t('Growth', 'צמיחה'), desc: t('Habits, streaks, 100-day phases. x1.5 at day 7, x2 at day 30.', 'הרגלים, streaks, שלבים. x1.5 ביום 7, x2 ביום 30.'), color: 'hsl(168 70% 50%)' },
                { icon: '📊', title: t('Data', 'נתונים'), desc: t('Sell anonymized insights. 80/20 split with granular consent.', 'מכירת תובנות אנונימיות. חלוקה 80/20 עם הסכמה גרנולרית.'), color: 'hsl(210 70% 50%)' },
                { icon: '💼', title: t('Work', 'עבודה'), desc: t('Gigs, bounties, service sales, and coach sessions.', 'גיגים, באונטי, מכירת שירותים, וסשנים.'), color: 'hsl(45 90% 55%)' },
                { icon: '📚', title: t('Learning', 'למידה'), desc: t('Every lesson and exercise is a verified mining action.', 'כל שיעור ותרגול הוא פעולת כרייה מאומתת.'), color: 'hsl(271 81% 55%)' },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color={item.color} />
              ))}
            </div>
          </VisualSection>
        );

      case 10: // Career Platform
        return (
          <VisualSection index={10} isActive number="10" title={t('5 Career Paths', '5 מסלולי קריירה')} subtitle={t('One infrastructure, five professional worlds.', 'תשתית אחת, חמישה עולמות מקצועיים.')} isHe={he} layout="center" accent="hsl(187 85% 50%)">
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🏢', title: t('Business Owner', 'בעל עסק'), desc: t('AI wizard, business plan, management dashboard.', 'ויזארד AI, תוכנית עסקית, דשבורד ניהול.') },
                { icon: '🎯', title: t('Coach', 'מאמן'), desc: t('Client management, methodology, landing page, CRM.', 'ניהול לקוחות, מתודולוגיה, דף נחיתה, CRM.') },
                { icon: '💆', title: t('Therapist', 'מטפל'), desc: t('Scheduling, CRM, and appointment management.', 'לוח זמנים, CRM, וניהול תורים.') },
                { icon: '🎨', title: t('Content Creator', 'יוצר תוכן'), desc: t('Creation tools, distribution, and community.', 'כלי יצירה, הפצה, וניהול קהילה.') },
                { icon: '💼', title: t('Freelancer', 'פרילנסר'), desc: t('Project management, invoicing, and portfolio.', 'ניהול פרויקטים, חשבוניות, ופורטפוליו.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.4 + i * 0.08} color="hsl(187 85% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 11: // Deep Gamification
        return (
          <VisualSection index={11} isActive number="11" title={t('Deep Gamification', 'גיימיפיקציה עמוקה')} isHe={he} layout="center" accent="hsl(25 90% 55%)">
            <div className="flex flex-wrap justify-center gap-3 pb-3">
              <StatCard value={100} suffix="+" label={t('Levels', 'רמות')} delay={0} color="hsl(25 90% 55%)" />
              <StatCard value={15} label={t('Skill Trees', 'עצי מיומנויות')} delay={0.1} color="hsl(271 81% 55%)" />
            </div>
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '⭐', title: t('XP & Levels', 'XP ורמות'), desc: t('Every action rewards XP and MOS. Level 1-100+ progression.', 'כל פעולה מתגמלת XP ו-MOS. התקדמות רמה 1-100+.') },
                { icon: '🔥', title: t('Streaks & Multipliers', 'Streaks ומכפילים'), desc: t('Daily consistency rewarded. x1.5 at day 7, x2 at day 30.', 'עקביות יומית מתוגמלת. x1.5 ביום 7, x2 ביום 30.') },
                { icon: '⚔️', title: t('Quests & Campaigns', 'Quests ו-Campaigns'), desc: t('Each day is a Quest, each week a Campaign — with unique names.', 'כל יום הוא Quest, כל שבוע Campaign — עם שמות ייחודיים.') },
                { icon: '⚡', title: t('Energy System', 'מערכת אנרגיה'), desc: t('Premium features consume energy. Transparent consumption model.', 'פיצ\'רים פרימיום צורכים אנרגיה. מודל צריכה שקוף.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(25 90% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 12: // Subscription Model
        return (
          <VisualSection index={12} isActive number="12" title={t('Subscription Model', 'מודל מנויים')} subtitle={t('"Depth of Power" hierarchy', 'היררכיית "עומק הכוח"')} isHe={he} layout="center" accent="hsl(271 81% 55%)">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {[
                { icon: '🌅', title: t('Awakening — Free', 'Awakening — חינם'), desc: t('Basic structure, XP, 5 Aurora messages/day, 2 pillars, Play Hub.', 'מבנה בסיסי, XP, 5 הודעות Aurora ביום, 2 עמודים, Play Hub.'), color: 'hsl(168 70% 50%)' },
                { icon: '🔥', title: t('Optimization — $69/mo', 'Optimization — $69/חודש'), desc: t('Unlimited Aurora memory, 6 pillars, 100-day plan, AI Hypnosis.', 'Aurora ללא הגבלת זיכרון, 6 עמודים, 100 ימים, היפנוזה AI.'), color: 'hsl(45 90% 55%)' },
                { icon: '👑', title: t('Command — $199/mo', 'Command — $199/חודש'), desc: t('All 15 pillars, proactive engine, modular plan updates.', 'כל 15 עמודים, מנוע פרואקטיבי, עדכוני תוכנית מודולריים.'), color: 'hsl(271 81% 55%)' },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color={item.color} />
              ))}
            </div>
          </VisualSection>
        );

      case 13: // Community
        return (
          <VisualSection index={13} isActive number="13" title={t('Community & Connection', 'קהילה וחיבור')} isHe={he} layout="center" accent="hsl(168 70% 45%)">
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '👥', title: t('Social Feed', 'פיד חברתי'), desc: t('Posts, comments, likes, Aurora AI participation.', 'פוסטים, תגובות, לייקים, השתתפות Aurora AI.') },
                { icon: '📸', title: t('Stories', 'סטוריז'), desc: t('Instagram-style stories tied to life pillars.', 'סטוריז בסגנון אינסטגרם מקושרים לעמודי חיים.') },
                { icon: '🏆', title: t('Level System', 'מערכת רמות'), desc: t('Rise in levels, earn points, and unlock content.', 'עלה ברמות, צבור נקודות ופתח תוכן.') },
                { icon: '🤝', title: t('AI Matching', 'AI Matching'), desc: t('Smart matching with accountability partners and mentors.', 'התאמה חכמה לשותפי אחריות ומנטורים.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(168 70% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 14: // Learn
        return (
          <VisualSection index={14} isActive number="14" title={t('Learn — Adaptive Learning', 'Learn — למידה אדפטיבית')} subtitle={t('"Aurora Teaches You"', '"Aurora מלמדת אותך"')} isHe={he} layout="center" accent="hsl(320 80% 55%)">
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '📚', title: t('Lazy Generation', 'Lazy Generation'), desc: t('Course skeleton created instantly. Content generated when you arrive.', 'שלד הקורס נוצר מיידית. התוכן מיוצר כשאתה מגיע.') },
                { icon: '🧪', title: t('Practical Exercises', 'תרגול מעשי'), desc: t('Auto-summarized and synced back to your action plan.', 'מסוכם אוטומטית ומסונכרן חזרה לתוכנית הפעולה.') },
                { icon: '🗺️', title: t('Guided Journeys', 'מסעות הכוונה'), desc: t('Onboarding, business, coaching, and projects journeys.', 'מסע אונבורדינג, עסקי, אימון, ופרויקטים.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(320 80% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 15: // Data Privacy & Security
        return (
          <VisualSection index={15} isActive number="15" title={t('Security & Privacy', 'אבטחה ופרטיות')} isHe={he} layout="center" accent="hsl(210 70% 50%)">
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '🔐', title: t('Web3Auth', 'Web3Auth'), desc: t('Decentralized login with built-in smart wallet.', 'התחברות מבוזרת עם ארנק חכם מובנה.') },
                { icon: '🛡️', title: t('Row-Level Security', 'RLS מלא'), desc: t('Each user sees only their own data. Tiered permissions.', 'כל משתמש רואה רק את הנתונים שלו. הרשאות מדורגות.') },
                { icon: '🔒', title: t('Full Encryption', 'הצפנה מלאה'), desc: t('All data encrypted. Delete anytime. No third-party sales.', 'כל הנתונים מוצפנים. מחיקה בכל עת. ללא מכירה לצד ג\'.') },
                { icon: '⛓️', title: t('Blockchain Ready', 'מוכן ל-Blockchain'), desc: t('AION as NFT. Digital ownership and Web3 wallet.', 'AION כ-NFT. בעלות דיגיטלית וארנק Web3.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(210 70% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 16: // Onboarding
        return (
          <VisualSection index={16} isActive number="16" title={t('Onboarding & Initiation', 'אונבורדינג וטקס כניסה')} isHe={he} layout="center" accent="hsl(45 90% 55%)">
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '📝', title: t('Multi-Step Setup', 'הרשמה מדורגת'), desc: t('Email signup, Aurora intro conversation, pillar selection.', 'הרשמה באימייל, שיחת היכרות עם Aurora, בחירת עמודים.') },
                { icon: '✨', title: t('Initiation Ceremony', 'טקס כניסה'), desc: t('Immersive visual experience — animations, music, first Soul Avatar.', 'חוויה ויזואלית אימרסיבית — אנימציות, מוזיקה, Soul Avatar ראשון.') },
                { icon: '🎮', title: t('First 100-Day Plan', 'תוכנית 100 ימים ראשונה'), desc: t('Aurora creates your personalized plan after onboarding.', 'Aurora יוצרת תוכנית מותאמת אישית לאחר ההצטרפות.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(45 90% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 17: // Affiliate Program
        return (
          <VisualSection index={17} isActive number="17" title={t('Affiliate Program', 'תוכנית שותפים')} isHe={he} layout="center" accent="hsl(168 70% 45%)">
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '🔗', title: t('Unique Referral Code', 'קוד הפניה ייחודי'), desc: t('Each affiliate gets a unique code with customizable commission.', 'כל שותף מקבל קוד ייחודי עם עמלה מותאמת.') },
                { icon: '📊', title: t('Analytics Dashboard', 'דשבורד אנליטיקס'), desc: t('Earnings stats, link management, referral tracking.', 'סטטיסטיקות רווחים, ניהול לינקים, מעקב הפניות.') },
                { icon: '💸', title: t('Payout History', 'היסטוריית תשלומים'), desc: t('Full payout tracking with approval status. Open enrollment.', 'מעקב תשלומים מלא עם סטטוס אישור. הצטרפות פתוחה.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(168 70% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 18: // Technology
        return (
          <VisualSection index={18} isActive number="18" title={t('Technology & Architecture', 'טכנולוגיה וארכיטקטורה')} isHe={he} layout="center" accent="hsl(210 70% 50%)">
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                { icon: '⚛️', title: t('Frontend', 'Frontend'), desc: t('React + TypeScript + Tailwind + Framer Motion + Three.js', 'React + TypeScript + Tailwind + Framer Motion + Three.js'), color: 'hsl(187 85% 50%)' },
                { icon: '🗄️', title: t('Backend', 'Backend'), desc: t('PostgreSQL, Auth, Server Functions, Storage, Realtime', 'PostgreSQL, Auth, Server Functions, Storage, Realtime'), color: 'hsl(168 70% 50%)' },
                { icon: '🤖', title: t('AI Models', 'מודלי AI'), desc: t('Gemini 2.5 Pro/Flash, GPT-5, multimodal processing', 'Gemini 2.5 Pro/Flash, GPT-5, עיבוד מולטימודלי'), color: 'hsl(271 81% 55%)' },
                { icon: '📱', title: t('Mobile-First PWA', 'PWA Mobile-First'), desc: t('Home screen install, offline support, push notifications.', 'התקנה למסך הבית, תמיכת offline, push notifications.'), color: 'hsl(45 90% 55%)' },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.4 + i * 0.1} color={item.color} />
              ))}
            </div>
          </VisualSection>
        );

      case 19: // Tokenomics
        return (
          <VisualSection index={19} isActive number="19" title={t('Tokenomics — MOS Economy', 'טוקנומיקס — כלכלת MOS')} isHe={he} layout="center" accent="hsl(45 90% 55%)">
            <div className="flex flex-wrap justify-center gap-3 pb-3">
              <StatCard value={100000000} label={t('Total Supply', 'סך היצע')} delay={0} color="hsl(45 90% 55%)" />
              <StatCard value={30} suffix="%" label={t('Community', 'קהילה')} delay={0.1} color="hsl(168 70% 50%)" />
              <StatCard value={2} suffix="%" label={t('Platform Fee', 'עמלת פלטפורמה')} delay={0.2} color="hsl(271 81% 55%)" />
            </div>
            <div className="grid gap-3 max-w-xl mx-auto">
              {[
                { icon: '📊', title: t('Distribution', 'חלוקה'), desc: t('30% Community, 20% Treasury, 20% Team, 15% Ecosystem, 15% Reserve.', '30% קהילה, 20% קרן, 20% צוות, 15% אקוסיסטם, 15% רזרבה.') },
                { icon: '🔥', title: t('Token Sinks', 'ספיגת טוקנים'), desc: t('Feature unlocks, boosts, premium access — remove tokens from circulation.', 'שחרור תכונות, בוסטים, גישה פרימיום — הסרת טוקנים ממחזור.') },
                { icon: '⚖️', title: t('Reputation Layer', 'שכבת מוניטין'), desc: t('Rewards scale with activity. Higher reputation = better multipliers.', 'תגמולים גדלים עם פעילות. מוניטין גבוה = מכפילים טובים.') },
                { icon: '🔄', title: t('Economic Loop', 'מחזור כלכלי'), desc: t('Earn → Use → Fee → Rewards. Self-sustaining circular economy.', 'הרוויח → השתמש → עמלה → תגמולים. כלכלה מעגלית.') },
              ].map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(45 90% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 20: // Roadmap
        return (
          <VisualSection index={20} isActive number="20" title={t('Roadmap', 'מפת דרכים')} isHe={he} layout="center" accent="hsl(25 90% 55%)">
            <RoadmapTimeline
              isHe={he}
              phases={[
                { label: 'Q1-Q2 2026', items: [t('MVP — Aurora, Play, Soul Avatar', 'MVP — Aurora, Play, Soul Avatar'), t('MOS Wallet, Web3Auth, PWA', 'ארנק MOS, Web3Auth, PWA'), t('Community, Stories, Journal', 'קהילה, סטוריז, יומן')], color: 'hsl(271 81% 55%)', active: true },
                { label: 'Q3-Q4 2026', items: [t('FreeMarket & marketplace', 'FreeMarket ושוק פנימי'), t('Learn — adaptive learning', 'Learn — למידה אדפטיבית'), t('Full career paths, Data Marketplace', 'מסלולי קריירה מלאים, שוק נתונים')], color: 'hsl(187 85% 50%)' },
                { label: '2027', items: [t('Full Web3, DAO, Solana', 'Web3 מלא, DAO, Solana'), t('Native Mobile', 'מובייל נייטיב'), t('Open API & integrations', 'API פתוח ואינטגרציות')], color: 'hsl(45 90% 55%)' },
                { label: '2028+', items: [t('Autonomous AI', 'AI אוטונומי'), t('Full decentralized economy', 'כלכלה מבוזרת מלאה'), t('Global platform', 'פלטפורמה גלובלית')], color: 'hsl(168 70% 50%)' },
              ]}
            />
          </VisualSection>
        );

      case 21: // Founder & Vision
        return (
          <VisualSection index={21} isActive number="21" title={t('The Vision', 'החזון')} isHe={he} layout="center" accent="hsl(271 81% 55%)">
            <div className="flex justify-center py-3">
              <WhitepaperOrb size={130} />
            </div>
            <div className="space-y-3 max-w-xl mx-auto">
              <motion.p className="text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {t(`Founder & CEO: ${founderName}`, `מייסד ומנכ"ל: ${founderName}`)}
              </motion.p>
              <motion.p className="text-sm text-muted-foreground leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                {t(
                  `Built from the ground up by a solo founder since September 2024 — no partners, no compromises on the vision. Every line of code crafted with deep passion for building the best Human Operating System possible.`,
                  `נבנה מאפס על ידי מייסד יחיד מאז ספטמבר 2024 — ללא שותפים, ללא פשרות על החזון. כל שורת קוד נוצרה מתוך תשוקה עמוקה לבניית מערכת ההפעלה האנושית הטובה ביותר.`
                )}
              </motion.p>
              {[
                t(`${brandName} is not a product — it's a movement.`, `${brandName} הוא לא מוצר — זו תנועה.`),
                t('A human operating system connecting technology to consciousness.', 'מערכת הפעלה אנושית שמחברת טכנולוגיה לתודעה.'),
                t('Join the journey. Activate your operating system.', 'הצטרף למסע. הפעל את מערכת ההפעלה שלך.'),
              ].map((text, i) => (
                <motion.p key={i} className={cn("text-base leading-relaxed", i === 2 ? "text-primary font-semibold text-lg pt-2" : "text-muted-foreground")} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.12 }}>
                  {text}
                </motion.p>
              ))}
            </div>
          </VisualSection>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-[hsl(var(--background))] overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <VisualWhitepaperScene currentSection={current} scrollProgress={scrollProgress} />
      </Suspense>

      {/* Overlay */}
      <div className="fixed inset-0 z-[1] bg-background/75" />

      {/* Section content */}
      <div className="relative z-[2] h-full">
        <AnimatePresence mode="wait">
          <motion.div key={current} className="h-full">
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav dots */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-[3] flex flex-col gap-1">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === current ? "bg-primary scale-[2] shadow-lg shadow-primary/30" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[3] h-0.5 bg-muted/20">
        <motion.div className="h-full bg-primary" animate={{ width: `${((current + 1) / totalSlides) * 100}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-[3] flex items-center justify-between px-4 py-3 bg-background/30 backdrop-blur-sm">
        <button onClick={onExit} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{he ? 'חזרה' : 'Back'}</span>
        </button>
        <span className="text-xs text-muted-foreground tabular-nums">{current + 1} / {totalSlides}</span>
        <button onClick={onExit} className="text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-3">
        <button onClick={() => goTo(current - 1)} disabled={current === 0} className="w-9 h-9 rounded-full border border-border bg-card/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-[0.95]">
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => goTo(current + 1)} disabled={current === totalSlides - 1} className="w-9 h-9 rounded-full border border-border bg-card/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-[0.95]">
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
