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
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const totalSlides = 12;

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

  const SECTION_ACCENTS = [
    'hsl(271 81% 55%)', // hero - purple
    'hsl(0 75% 55%)',   // problem - red
    'hsl(187 85% 45%)', // solution - cyan
    'hsl(45 90% 55%)',  // 5 core - gold
    'hsl(271 81% 55%)', // aurora - purple
    'hsl(320 80% 55%)', // soul avatar - pink
    'hsl(45 90% 55%)',  // economy - gold
    'hsl(187 85% 50%)', // careers - cyan
    'hsl(168 70% 45%)', // community - teal
    'hsl(210 70% 50%)', // security - blue
    'hsl(25 90% 55%)',  // roadmap - orange
    'hsl(271 81% 55%)', // vision - purple
  ];

  const renderSlideContent = () => {
    switch (current) {
      case 0: // Hero
        return (
          <VisualSection index={0} isActive title={brandName || 'MindOS'} subtitle={he ? 'מערכת ההפעלה האנושית הראשונה מבוססת AI' : 'The First AI-Powered Human Operating System'} isHe={he} layout="center">
            <div className="flex justify-center pt-4">
              <WhitepaperOrb size={180} />
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              <StatCard value={5} label={he ? 'חוויות ליבה' : 'Core Experiences'} delay={0} color="hsl(271 81% 55%)" />
              <StatCard value={100} suffix="%" label={he ? 'מבוסס AI' : 'AI-Powered'} delay={0.1} color="hsl(187 85% 50%)" />
              <StatCard value={10} label={he ? 'שלבי מסע' : 'Journey Steps'} delay={0.2} color="hsl(45 90% 55%)" />
            </div>
          </VisualSection>
        );

      case 1: // Problem
        return (
          <VisualSection index={1} isActive number="01" title={he ? 'הבעיה' : 'The Problem'} isHe={he} layout="center" accent={SECTION_ACCENTS[1]}>
            <div className="grid gap-3 max-w-2xl mx-auto">
              {(he ? [
                { icon: '📱', title: '80+ אפליקציות', desc: 'המשתמש הממוצע מתקין 80+ אפליקציות ומשתמש ב-9 ביום.' },
                { icon: '🧠', title: 'פיצול קוגניטיבי', desc: 'מידע מפוזר בין עשרות כלים מנותקים.' },
                { icon: '😩', title: 'עומס דיגיטלי', desc: 'תחושת חוסר שליטה, שחיקה, וחוסר כיוון.' },
              ] : [
                { icon: '📱', title: '80+ Apps Installed', desc: 'Average user installs 80+ apps and uses 9 daily.' },
                { icon: '🧠', title: 'Cognitive Fragmentation', desc: 'Information scattered across dozens of disconnected tools.' },
                { icon: '😩', title: 'Digital Overwhelm', desc: 'Feeling of lost control, burnout, and no direction.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(0 75% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 2: // Solution
        return (
          <VisualSection index={2} isActive number="02" title={he ? 'הפתרון' : 'The Solution'} subtitle={he ? 'לא עוד אפליקציה — מערכת ההפעלה של החיים שלך.' : 'Not another app — the operating system of your life.'} isHe={he} layout="center" accent={SECTION_ACCENTS[2]}>
            <div className="grid gap-3 max-w-2xl mx-auto">
              {(he ? [
                { icon: '🔗', title: 'שכבה אינטליגנטית אחת', desc: 'מעל כל תחומי החיים — בריאות, קריירה, זוגיות, כסף.' },
                { icon: '🤖', title: 'AI אדפטיבי', desc: 'מנוע בינה מלאכותית שמתפתח ולומד אותך לאורך זמן.' },
                { icon: '🌐', title: 'Web3 מובנה', desc: 'בעלות דיגיטלית, תגמולים, ושוק חופשי מבוזר.' },
              ] : [
                { icon: '🔗', title: 'One Intelligent Layer', desc: 'Above all life domains — health, career, relationships, finances.' },
                { icon: '🤖', title: 'Adaptive AI', desc: 'AI engine that evolves and learns you over time.' },
                { icon: '🌐', title: 'Built-in Web3', desc: 'Digital ownership, rewards, and decentralized marketplace.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.12} color="hsl(187 85% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 3: // Five Core
        return (
          <VisualSection index={3} isActive number="03" title={he ? 'חמש חוויות ליבה' : 'Five Core Experiences'} isHe={he} layout="center" accent={SECTION_ACCENTS[3]}>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {(he ? [
                { icon: '🎮', title: 'Play', desc: 'מרכז ביצוע מאוחד עם תוכנית 100 ימים', color: 'hsl(271 81% 55%)' },
                { icon: '🧠', title: 'Aurora', desc: 'מנוע AI תודעתי אדפטיבי', color: 'hsl(187 85% 50%)' },
                { icon: '🏪', title: 'FreeMarket', desc: 'שוק חופשי וכלכלת Earn', color: 'hsl(45 90% 55%)' },
                { icon: '👥', title: 'Community', desc: 'פיד חברתי ומערכת רמות', color: 'hsl(168 70% 50%)' },
                { icon: '📚', title: 'Learn', desc: 'למידה אדפטיבית מבוססת AI', color: 'hsl(320 80% 55%)' },
              ] : [
                { icon: '🎮', title: 'Play', desc: 'Unified execution hub with 100-day plans', color: 'hsl(271 81% 55%)' },
                { icon: '🧠', title: 'Aurora', desc: 'Adaptive consciousness AI engine', color: 'hsl(187 85% 50%)' },
                { icon: '🏪', title: 'FreeMarket', desc: 'Marketplace & Earn economy', color: 'hsl(45 90% 55%)' },
                { icon: '👥', title: 'Community', desc: 'Social feed & level system', color: 'hsl(168 70% 50%)' },
                { icon: '📚', title: 'Learn', desc: 'AI-powered adaptive learning', color: 'hsl(320 80% 55%)' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.4 + i * 0.1} color={item.color} />
              ))}
            </div>
          </VisualSection>
        );

      case 4: // Aurora
        return (
          <VisualSection index={4} isActive number="04" title={he ? 'Aurora — מנוע ה-AI התודעתי' : 'Aurora — Consciousness AI'} subtitle={he ? 'לא צ\'אטבוט — מנוע תודעתי שמתפתח איתך.' : 'Not a chatbot — a consciousness engine that evolves with you.'} isHe={he} layout="center" accent={SECTION_ACCENTS[4]}>
            <div className="grid gap-3 max-w-2xl mx-auto">
              {(he ? [
                { icon: '🔮', title: 'מודעות הקשרית', desc: 'מתבססת על שיחות, תוכניות, סריקות עומק ומצב רגשי.' },
                { icon: '🎤', title: 'מצב קולי', desc: 'תמיכה במצב קולי דו-כיווני ועיבוד מולטימודלי.' },
                { icon: '📊', title: 'גרף זיכרון', desc: 'בניית פרופיל דינמי של הזהות, ההעדפות והדפוסים שלך.' },
                { icon: '⚡', title: 'פרואקטיבית', desc: 'יוזמת פעולות, תזכורות ותובנות בהתבסס על ההקשר שלך.' },
              ] : [
                { icon: '🔮', title: 'Full Context Awareness', desc: 'Based on conversations, plans, deep scans, and emotional state.' },
                { icon: '🎤', title: 'Voice Mode', desc: 'Bidirectional voice mode and multimodal processing.' },
                { icon: '📊', title: 'Memory Graph', desc: 'Builds a dynamic profile of your identity, preferences, and patterns.' },
                { icon: '⚡', title: 'Proactive', desc: 'Initiates actions, reminders, and insights based on your context.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(271 81% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 5: // Soul Avatar
        return (
          <VisualSection index={5} isActive number="05" title={he ? 'Soul Avatar NFT' : 'Soul Avatar NFT'} isHe={he} layout="center" accent={SECTION_ACCENTS[5]}>
            <div className="flex justify-center py-2">
              <WhitepaperOrb size={120} />
            </div>
            <div className="space-y-3 max-w-xl mx-auto">
              {(he ? [
                'ייצוג חזותי חי של הזהות האישית שלך.',
                'האורב משתנה בהתאם להתקדמות, מצב רוח ורמת מודעות.',
                'מונפק כ-NFT ייחודי שצומח איתך לאורך זמן.',
                'מבוסס על ארכיטיפים, מיומנויות ודפוסי אנרגיה.',
              ] : [
                'A living visual representation of your personal identity.',
                'Shifts based on progress, mood, and awareness level.',
                'Minted as a unique NFT that grows with you over time.',
                'Based on archetypes, skills, and energy patterns.',
              ]).map((text, i) => (
                <motion.p key={i} className="text-sm text-muted-foreground leading-relaxed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}>
                  {text}
                </motion.p>
              ))}
            </div>
          </VisualSection>
        );

      case 6: // Economy
        return (
          <VisualSection index={6} isActive number="06" title={he ? 'כלכלת MOS' : 'MOS Economy'} subtitle={he ? 'מבוסס Proof of Growth — תגמול על צמיחה אנושית אמיתית.' : 'Based on Proof of Growth — rewarding genuine human growth.'} isHe={he} layout="center" accent={SECTION_ACCENTS[6]}>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <StatCard value={100} suffix=" MOS" label="= $1.00" delay={0} color="hsl(45 90% 55%)" />
              <StatCard value={1000000000} prefix="" suffix="" label={he ? 'סך טוקנים' : 'Total Supply'} delay={0.15} color="hsl(271 81% 55%)" />
              <StatCard value={40} suffix="%" label={he ? 'תגמולי קהילה' : 'Community Rewards'} delay={0.3} color="hsl(168 70% 50%)" />
            </div>
            <div className="grid gap-3 max-w-xl mx-auto pt-4">
              {(he ? [
                { icon: '🏪', title: 'שוק פנימי', desc: 'קנייה ומכירה של שירותים, תוכן ומוצרים.' },
                { icon: '🎯', title: 'תגמולי פעילות', desc: 'הרווח MOS על השלמת משימות, הרגלים ואתגרים.' },
                { icon: '💎', title: 'שדרוגים', desc: 'שחרור תכונות פרימיום, תוכן ושירותים.' },
              ] : [
                { icon: '🏪', title: 'Internal Marketplace', desc: 'Buy and sell services, content, and products.' },
                { icon: '🎯', title: 'Activity Rewards', desc: 'Earn MOS for completing tasks, habits, and challenges.' },
                { icon: '💎', title: 'Upgrades', desc: 'Unlock premium features, content, and services.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.6 + i * 0.1} color="hsl(45 90% 55%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 7: // Career Paths
        return (
          <VisualSection index={7} isActive number="07" title={he ? '5 מסלולי קריירה' : '5 Career Paths'} subtitle={he ? 'תשתית אחת, חמישה עולמות מקצועיים.' : 'One infrastructure, five professional worlds.'} isHe={he} layout="center" accent={SECTION_ACCENTS[7]}>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {(he ? [
                { icon: '🏢', title: 'בעל עסק', desc: 'ויזארד AI, תוכנית עסקית, דשבורד ניהול.' },
                { icon: '🎯', title: 'מאמן', desc: 'ניהול לקוחות, מתודולוגיה, דף נחיתה.' },
                { icon: '💆', title: 'מטפל', desc: 'לוח זמנים, CRM, וניהול תורים.' },
                { icon: '🎨', title: 'יוצר תוכן', desc: 'כלי יצירה, הפצה, וניהול קהילה.' },
                { icon: '💼', title: 'פרילנסר', desc: 'ניהול פרויקטים, חשבוניות, ופורטפוליו.' },
              ] : [
                { icon: '🏢', title: 'Business Owner', desc: 'AI wizard, business plan, management dashboard.' },
                { icon: '🎯', title: 'Coach', desc: 'Client management, methodology, landing page.' },
                { icon: '💆', title: 'Therapist', desc: 'Scheduling, CRM, and appointment management.' },
                { icon: '🎨', title: 'Content Creator', desc: 'Creation tools, distribution, and community management.' },
                { icon: '💼', title: 'Freelancer', desc: 'Project management, invoicing, and portfolio.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.4 + i * 0.08} color="hsl(187 85% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 8: // Community
        return (
          <VisualSection index={8} isActive number="08" title={he ? 'קהילה וחיבור' : 'Community & Connection'} isHe={he} layout="center" accent={SECTION_ACCENTS[8]}>
            <div className="grid gap-3 max-w-xl mx-auto">
              {(he ? [
                { icon: '👥', title: 'פיד חברתי', desc: 'שתף תובנות, הישגים ואתגרים עם הקהילה.' },
                { icon: '🏆', title: 'מערכת רמות', desc: 'עלה ברמות, צבור נקודות ופתח תוכן.' },
                { icon: '🤝', title: 'AI Matching', desc: 'התאמה חכמה לשותפי אחריות ומנטורים.' },
                { icon: '📅', title: 'אירועים', desc: 'סדנאות, מפגשים ואתגרים קהילתיים.' },
              ] : [
                { icon: '👥', title: 'Social Feed', desc: 'Share insights, achievements, and challenges with the community.' },
                { icon: '🏆', title: 'Level System', desc: 'Rise in levels, earn points, and unlock content.' },
                { icon: '🤝', title: 'AI Matching', desc: 'Smart matching with accountability partners and mentors.' },
                { icon: '📅', title: 'Events', desc: 'Workshops, meetups, and community challenges.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(168 70% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 9: // Security & Web3
        return (
          <VisualSection index={9} isActive number="09" title={he ? 'אבטחה ו-Web3' : 'Security & Web3'} isHe={he} layout="center" accent={SECTION_ACCENTS[9]}>
            <div className="grid gap-3 max-w-xl mx-auto">
              {(he ? [
                { icon: '🔐', title: 'Web3Auth', desc: 'התחברות מבוזרת עם ארנק חכם מובנה.' },
                { icon: '🛡️', title: 'RLS מלא', desc: 'הגנת נתונים ברמת שורה — כל משתמש רואה רק את שלו.' },
                { icon: '⛓️', title: 'NFT ו-Blockchain', desc: 'Soul Avatar כ-NFT, טוקנים ובעלות דיגיטלית.' },
                { icon: '🔒', title: 'פרטיות מלאה', desc: 'הנתונים שלך שייכים לך — תמיד.' },
              ] : [
                { icon: '🔐', title: 'Web3Auth', desc: 'Decentralized login with built-in smart wallet.' },
                { icon: '🛡️', title: 'Full RLS', desc: 'Row-level security — each user sees only their own data.' },
                { icon: '⛓️', title: 'NFT & Blockchain', desc: 'Soul Avatar as NFT, tokens, and digital ownership.' },
                { icon: '🔒', title: 'Full Privacy', desc: 'Your data belongs to you — always.' },
              ]).map((item, i) => (
                <FeatureNode key={i} icon={item.icon} title={item.title} description={item.desc} delay={0.5 + i * 0.1} color="hsl(210 70% 50%)" />
              ))}
            </div>
          </VisualSection>
        );

      case 10: // Roadmap
        return (
          <VisualSection index={10} isActive number="10" title={he ? 'מפת דרכים' : 'Roadmap'} isHe={he} layout="center" accent={SECTION_ACCENTS[10]}>
            <RoadmapTimeline
              isHe={he}
              phases={he ? [
                { label: 'Q1-Q2 2026', items: ['MVP — Aurora, Play, Soul Avatar', 'ארנק MOS, אימות Web3Auth', 'תשתית קהילה ופיד'], color: 'hsl(271 81% 55%)', active: true },
                { label: 'Q3-Q4 2026', items: ['FreeMarket ושוק פנימי', 'Learn — למידה אדפטיבית', 'מסלולי קריירה מלאים'], color: 'hsl(187 85% 50%)' },
                { label: '2027', items: ['Web3 מלא, DAO', 'מובייל נייטיב', 'API פתוח ואינטגרציות'], color: 'hsl(45 90% 55%)' },
                { label: '2028+', items: ['AI אוטונומי', 'כלכלה מבוזרת מלאה', 'פלטפורמה גלובלית'], color: 'hsl(168 70% 50%)' },
              ] : [
                { label: 'Q1-Q2 2026', items: ['MVP — Aurora, Play, Soul Avatar', 'MOS Wallet, Web3Auth', 'Community infrastructure & feed'], color: 'hsl(271 81% 55%)', active: true },
                { label: 'Q3-Q4 2026', items: ['FreeMarket & internal marketplace', 'Learn — adaptive learning', 'Full career paths'], color: 'hsl(187 85% 50%)' },
                { label: '2027', items: ['Full Web3, DAO', 'Native Mobile', 'Open API & integrations'], color: 'hsl(45 90% 55%)' },
                { label: '2028+', items: ['Autonomous AI', 'Full decentralized economy', 'Global platform'], color: 'hsl(168 70% 50%)' },
              ]}
            />
          </VisualSection>
        );

      case 11: // Vision
        return (
          <VisualSection index={11} isActive number="11" title={he ? 'החזון' : 'The Vision'} isHe={he} layout="center" accent={SECTION_ACCENTS[11]}>
            <div className="flex justify-center py-4">
              <WhitepaperOrb size={140} />
            </div>
            <div className="space-y-4 max-w-xl mx-auto">
              {(he ? [
                `${brandName} הוא לא מוצר — זו תנועה.`,
                'מערכת הפעלה אנושית שמחברת טכנולוגיה לתודעה.',
                'עולם שבו כל אדם יכול לנהל את חייו ממקום אחד.',
                'הצטרף למסע. הפעל את מערכת ההפעלה שלך.',
              ] : [
                `${brandName} is not a product — it's a movement.`,
                'A human operating system connecting technology to consciousness.',
                'A world where everyone can manage their life from one place.',
                'Join the journey. Activate your operating system.',
              ]).map((text, i) => (
                <motion.p key={i} className={cn("text-base md:text-lg leading-relaxed", i === 3 ? "text-primary font-semibold text-lg md:text-xl pt-2" : "text-muted-foreground")} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.12, duration: 0.6 }}>
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
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-[3] flex flex-col gap-1.5">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === current ? "bg-primary scale-150 shadow-lg shadow-primary/30" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
