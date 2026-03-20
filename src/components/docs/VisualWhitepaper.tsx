import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { VisualWhitepaperScene } from './visual/VisualWhitepaperScene';
import { VisualSection } from './visual/VisualSection';
import { cn } from '@/lib/utils';

interface VisualSlide {
  number?: string;
  title: string;
  paragraphs: string[];
}

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

  const slides: VisualSlide[] = [
    // 0 - Hero
    {
      title: brandName || 'MindOS',
      paragraphs: [
        he ? 'מערכת ההפעלה האנושית הראשונה מבוססת בינה מלאכותית' : 'The First AI-Powered Human Operating System',
      ],
    },
    // 1 - Problem
    {
      number: '01',
      title: he ? 'הבעיה' : 'The Problem',
      paragraphs: he ? [
        'האדם המודרני מנהל את חייו דרך עשרות כלים מנותקים.',
        'המשתמש הממוצע מתקין 80+ אפליקציות ומשתמש ב-9 ביום.',
        'פיצול קוגניטיבי, עומס דיגיטלי, תחושת חוסר שליטה.',
      ] : [
        'Modern humans manage life through dozens of disconnected tools.',
        'The average user installs 80+ apps and uses 9 daily.',
        'Cognitive fragmentation, digital overload, loss of control.',
      ],
    },
    // 2 - Solution
    {
      number: '02',
      title: he ? 'הפתרון' : 'The Solution',
      paragraphs: he ? [
        'שכבה אינטליגנטית אחת מעל כל תחומי החיים.',
        'בריאות, קריירה, זוגיות, כסף, הרגלים ותודעה — הכל מאוחד.',
        'לא עוד אפליקציה. מערכת ההפעלה של החיים שלך.',
      ] : [
        'A single intelligent layer above all life domains.',
        'Health, career, relationships, finances, habits & consciousness — unified.',
        'Not another app. The operating system of your life.',
      ],
    },
    // 3 - Five Core Experiences
    {
      number: '03',
      title: he ? 'חמש חוויות ליבה' : 'Five Core Experiences',
      paragraphs: he ? [
        '🎮 Play — מרכז ביצוע מאוחד עם תוכנית 100 ימים',
        '🧠 Aurora — מנוע AI תודעתי אדפטיבי',
        '🏪 FreeMarket — שוק חופשי וכלכלת Earn',
        '👥 Community — פיד חברתי ומערכת רמות',
        '📚 Learn — למידה אדפטיבית מבוססת AI',
      ] : [
        '🎮 Play — Unified execution hub with 100-day plans',
        '🧠 Aurora — Adaptive consciousness AI engine',
        '🏪 FreeMarket — Marketplace & Earn economy',
        '👥 Community — Social feed & level system',
        '📚 Learn — AI-powered adaptive learning',
      ],
    },
    // 4 - Aurora
    {
      number: '04',
      title: he ? 'Aurora — מנוע ה-AI התודעתי' : 'Aurora — Consciousness AI',
      paragraphs: he ? [
        'לא צ\'אטבוט — מנוע תודעתי שמתפתח איתך.',
        'מודעות הקשרית מלאה: שיחות, תוכניות, סריקות עומק.',
        'תמיכה במצב קולי דו-כיווני ועיבוד מולטימודלי.',
      ] : [
        'Not a chatbot — a consciousness engine that evolves with you.',
        'Full contextual awareness: conversations, plans, deep scans.',
        'Bidirectional voice mode and multimodal processing.',
      ],
    },
    // 5 - Soul Avatar
    {
      number: '05',
      title: he ? 'Soul Avatar NFT' : 'Soul Avatar NFT',
      paragraphs: he ? [
        'ייצוג חזותי חי של הזהות האישית שלך.',
        'האורב משתנה בהתאם להתקדמות, מצב רוח, ורמת מודעות.',
        'מונפק כ-NFT ייחודי שצומח איתך לאורך זמן.',
      ] : [
        'A living visual representation of your personal identity.',
        'The orb shifts based on progress, mood & awareness level.',
        'Minted as a unique NFT that grows with you over time.',
      ],
    },
    // 6 - Economy
    {
      number: '06',
      title: he ? 'כלכלת MOS' : 'MOS Economy',
      paragraphs: he ? [
        'מטבע פנימי: 100 MOS = $1.00',
        'מבוסס Proof of Growth — תגמול על פעילות אנושית אמיתית.',
        'שימושים: שוק פנימי, שירותים, תוכן פרימיום, שדרוגים.',
      ] : [
        'Internal currency: 100 MOS = $1.00',
        'Based on Proof of Growth — rewarding genuine human activity.',
        'Uses: marketplace, services, premium content, upgrades.',
      ],
    },
    // 7 - Career Paths
    {
      number: '07',
      title: he ? '5 מסלולי קריירה' : '5 Career Paths',
      paragraphs: he ? [
        'בעל עסק • מאמן • מטפל • יוצר תוכן • פרילנסר',
        'כל מסלול כולל ויזארד AI, דשבורד ניהול, וחנות אישית.',
        'תשתית אחת, חמישה עולמות מקצועיים.',
      ] : [
        'Business Owner • Coach • Therapist • Creator • Freelancer',
        'Each path includes an AI wizard, dashboard & personal storefront.',
        'One infrastructure, five professional worlds.',
      ],
    },
    // 8 - Roadmap
    {
      number: '08',
      title: he ? 'מפת דרכים' : 'Roadmap',
      paragraphs: he ? [
        'Q1-Q2: MVP — Aurora, Play, Soul Avatar, ארנק MOS',
        'Q3-Q4: FreeMarket, Learn, Community, מסלולי קריירה',
        '2027: Web3 מלא, DAO, מובייל נייטיב, API פתוח',
      ] : [
        'Q1-Q2: MVP — Aurora, Play, Soul Avatar, MOS Wallet',
        'Q3-Q4: FreeMarket, Learn, Community, Career Paths',
        '2027: Full Web3, DAO, Native Mobile, Open API',
      ],
    },
    // 9 - Vision
    {
      number: '09',
      title: he ? 'החזון' : 'The Vision',
      paragraphs: he ? [
        `${brandName} הוא לא מוצר — זו תנועה.`,
        'מערכת הפעלה אנושית שמחברת טכנולוגיה לתודעה.',
        'הצטרף למסע. הפעל את מערכת ההפעלה שלך.',
      ] : [
        `${brandName} is not a product — it\'s a movement.`,
        'A human operating system connecting technology to consciousness.',
        'Join the journey. Activate your operating system.',
      ],
    },
  ];

  const totalSlides = slides.length;

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= totalSlides || isScrolling.current) return;
    isScrolling.current = true;
    setCurrent(idx);
    setTimeout(() => { isScrolling.current = false; }, 800);
  }, [totalSlides]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, goTo, onExit]);

  // Wheel nav
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

  // Touch nav
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return;
      if (diff > 0) goTo(current + 1);
      else goTo(current - 1);
    };
    const el = containerRef.current;
    if (el) { el.addEventListener('touchstart', onStart); el.addEventListener('touchend', onEnd); }
    return () => { if (el) { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd); } };
  }, [current, goTo]);

  const scrollProgress = totalSlides > 1 ? current / (totalSlides - 1) : 0;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-[hsl(var(--background))] overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <VisualWhitepaperScene currentSection={current} scrollProgress={scrollProgress} />
      </Suspense>

      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 z-[1] bg-background/70" />

      {/* Sections */}
      <div className="relative z-[2] h-full">
        <AnimatePresence mode="wait">
          <VisualSection
            key={current}
            index={current}
            isActive
            number={slides[current].number}
            title={slides[current].title}
            isHe={he}
          >
            {slides[current].paragraphs.map((p, i) => (
              <motion.p
                key={i}
                className={cn(
                  "text-base md:text-lg text-muted-foreground leading-relaxed",
                  current === 0 && "text-xl md:text-2xl text-foreground/80 font-medium"
                )}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {p}
              </motion.p>
            ))}
          </VisualSection>
        </AnimatePresence>
      </div>

      {/* Nav dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[3] flex flex-col gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === current ? "bg-primary scale-125 shadow-lg shadow-primary/30" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[3] h-1 bg-muted/30">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((current + 1) / totalSlides) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-[3] flex items-center justify-between px-4 py-3">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{he ? 'חזרה' : 'Back'}</span>
        </button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {current + 1} / {totalSlides}
        </span>
        <button
          onClick={onExit}
          className="text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom nav arrows */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-3">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="w-10 h-10 rounded-full border border-border bg-card/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-[0.95]"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === totalSlides - 1}
          className="w-10 h-10 rounded-full border border-border bg-card/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-[0.95]"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
