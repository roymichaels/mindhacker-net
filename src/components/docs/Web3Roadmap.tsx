/**
 * Web3-style visual roadmap timeline for the whitepaper
 */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Rocket, Zap, Globe, Link2, Crown, Sparkles } from 'lucide-react';

interface RoadmapPhase {
  quarter: string;
  status: 'done' | 'active' | 'upcoming';
  icon: React.ReactNode;
  titleHe: string;
  titleEn: string;
  items: { he: string; en: string }[];
}

const phases: RoadmapPhase[] = [
  {
    quarter: 'Q1 2026',
    status: 'active',
    icon: <Rocket className="w-5 h-5" />,
    titleHe: 'השקה ציבורית',
    titleEn: 'Public Launch',
    items: [
      { he: '5 חוויות ליבה פעילות', en: '5 Active Core Experiences' },
      { he: 'מנוע כרייה MOS', en: 'MOS Mining Engine' },
      { he: 'היפנוזה AI', en: 'AI Hypnosis' },
      { he: 'תוכנית 100 ימים', en: '100-Day Plan' },
      { he: 'Beta ציבורי', en: 'Public Beta' },
      { he: '🎮 מנגנון Play2Earn', en: '🎮 Play2Earn Mechanism' },
      { he: '🪙 מנטינג AION NFT', en: '🪙 AION NFT Minting' },
      { he: 'סטוריז + פיד חברתי', en: 'Stories + Social Feed' },
      { he: 'חנויות מאמנים אישיות', en: 'Coach Storefronts' },
      { he: 'תוכנית שותפים', en: 'Affiliate Program' },
      { he: 'יומן Aurora', en: 'Aurora Journal' },
      { he: 'מצב קולי', en: 'Voice Mode' },
    ],
  },
  {
    quarter: 'Q2 2026',
    status: 'upcoming',
    icon: <Zap className="w-5 h-5" />,
    titleHe: 'פלטפורמת מאמנים',
    titleEn: 'Coach Platform',
    items: [
      { he: 'פלטפורמת מאמנים מתקדמת', en: 'Advanced Coach Platform' },
      { he: 'שוק נתונים', en: 'Data Marketplace' },
      { he: 'API פתוח', en: 'Open API' },
      { he: 'אנליטיקס מתקדם', en: 'Advanced Analytics' },
    ],
  },
  {
    quarter: 'Q3 2026',
    status: 'upcoming',
    icon: <Link2 className="w-5 h-5" />,
    titleHe: 'NFT & מובייל',
    titleEn: 'NFT & Mobile',
    items: [
      { he: 'ייצוא AION ל-Blockchain', en: 'AION Export to Blockchain' },
      { he: 'אפליקציית מובייל Native', en: 'Native Mobile App' },
      { he: 'אינטגרציות חיצוניות', en: 'External Integrations' },
    ],
  },
  {
    quarter: 'Q4 2026',
    status: 'upcoming',
    icon: <Globe className="w-5 h-5" />,
    titleHe: 'הרחבה גלובלית',
    titleEn: 'Global Expansion',
    items: [
      { he: 'שותפויות B2B', en: 'B2B Partnerships' },
      { he: 'הרחבה גלובלית', en: 'Global Expansion' },
      { he: 'שפות נוספות', en: 'Additional Languages' },
    ],
  },
  {
    quarter: '2027',
    status: 'upcoming',
    icon: <Crown className="w-5 h-5" />,
    titleHe: 'Web3 & DAO',
    titleEn: 'Web3 & DAO',
    items: [
      { he: 'Blockchain Integration מלא', en: 'Full Blockchain Integration' },
      { he: 'DAO Governance', en: 'DAO Governance' },
      { he: 'MOS על רשת Solana', en: 'MOS on Solana Network' },
      { he: 'שוק NFT חיצוני', en: 'External NFT Marketplace' },
      { he: 'יישוב Stripe לפיאט', en: 'Stripe Fiat Settlement' },
    ],
  },
];

const statusColors = {
  done: {
    dot: 'bg-emerald-500 shadow-[0_0_12px_4px_hsl(var(--primary)/0.4)]',
    line: 'bg-emerald-500/60',
    card: 'border-emerald-500/30 bg-emerald-500/5',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    glow: '0 0 20px 4px hsl(152 69% 53% / 0.15)',
  },
  active: {
    dot: 'bg-primary shadow-[0_0_16px_6px_hsl(var(--primary)/0.5)] animate-pulse',
    line: 'bg-primary/60',
    card: 'border-primary/40 bg-primary/5',
    badge: 'bg-primary/20 text-primary border-primary/30',
    glow: '0 0 30px 8px hsl(var(--primary) / 0.2)',
  },
  upcoming: {
    dot: 'bg-muted-foreground/30 border-2 border-muted-foreground/20',
    line: 'bg-border/40',
    card: 'border-border/30 bg-card/50',
    badge: 'bg-muted/50 text-muted-foreground border-border/30',
    glow: 'none',
  },
};

export function Web3Roadmap({ isHe }: { isHe: boolean }) {
  return (
    <div className="relative py-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="relative space-y-0">
        {phases.map((phase, idx) => {
          const colors = statusColors[phase.status];
          const isLast = idx === phases.length - 1;

          return (
            <motion.div
              key={phase.quarter}
              initial={{ opacity: 0, x: isHe ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className="relative flex gap-4 md:gap-6"
            >
              <div className="flex flex-col items-center shrink-0 w-10 md:w-14">
                <div
                  className={cn(
                    "relative z-10 w-4 h-4 md:w-5 md:h-5 rounded-full mt-6 transition-all",
                    colors.dot
                  )}
                  style={{ boxShadow: colors.glow }}
                >
                  {phase.status === 'active' && (
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  )}
                </div>

                {!isLast && (
                  <div className={cn(
                    "flex-1 w-0.5 min-h-[20px]",
                    colors.line
                  )} />
                )}
              </div>

              <div
                className={cn(
                  "flex-1 rounded-2xl border backdrop-blur-sm p-4 md:p-5 mb-4 transition-all hover:scale-[1.01]",
                  colors.card
                )}
                style={{ boxShadow: phase.status !== 'upcoming' ? colors.glow : undefined }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-xl border",
                      colors.badge
                    )}
                  >
                    {phase.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        colors.badge
                      )}>
                        {phase.quarter}
                      </span>
                      {phase.status === 'active' && (
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-primary">
                          <Sparkles className="w-3 h-3" />
                          {isHe ? 'כעת פעיל' : 'LIVE'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-foreground mt-0.5">
                      {isHe ? phase.titleHe : phase.titleEn}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {phase.items.map((item, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.12 + j * 0.05 }}
                      className={cn(
                        "flex items-center gap-2 text-xs md:text-sm rounded-lg px-2.5 py-1.5",
                        phase.status === 'done'
                          ? "text-emerald-400/80"
                          : phase.status === 'active'
                            ? "text-foreground/80"
                            : "text-muted-foreground/60"
                      )}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        phase.status === 'done' ? 'bg-emerald-500'
                          : phase.status === 'active' ? 'bg-primary'
                            : 'bg-muted-foreground/30'
                      )} />
                      {isHe ? item.he : item.en}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          <span className="w-8 h-px bg-border/40" />
          {isHe ? 'המסע ממשיך' : 'The journey continues'}
          <span className="w-8 h-px bg-border/40" />
        </div>
      </div>
    </div>
  );
}
