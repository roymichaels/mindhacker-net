/**
 * CityShowcaseSection — 6 district cards consolidating all game features
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Globe, Fingerprint, Brain, Headphones, Coins, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';

const DISTRICT_COLORS = [
  'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  'from-violet-500/20 to-indigo-500/20 border-violet-500/30',
  'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  'from-rose-500/20 to-pink-500/20 border-rose-500/30',
];

function DomainIconsPreview() {
  const icons = CORE_DOMAINS.slice(0, 7);
  return (
    <div className="flex gap-1.5 mt-3">
      {icons.map((d) => {
        const Icon = d.icon;
        return (
          <motion.div
            key={d.id}
            className="w-7 h-7 rounded-md bg-card/60 border border-border/30 flex items-center justify-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
          </motion.div>
        );
      })}
    </div>
  );
}

function TraitBadgesPreview({ isRTL }: { isRTL: boolean }) {
  const traits = [
    { name: isRTL ? 'חוסן' : 'Resilience', color: 'bg-emerald-500/30 border-emerald-500/40' },
    { name: isRTL ? 'מיקוד' : 'Focus', color: 'bg-cyan-500/30 border-cyan-500/40' },
    { name: isRTL ? 'כריזמה' : 'Charisma', color: 'bg-purple-500/30 border-purple-500/40' },
  ];
  return (
    <div className="flex gap-2 mt-3">
      {traits.map((t, i) => (
        <motion.div
          key={i}
          className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold border', t.color, 'text-foreground/80')}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        >
          {t.name}
        </motion.div>
      ))}
    </div>
  );
}

function PlanPulsePreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-400"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <span className="text-[10px] text-muted-foreground font-mono ml-1">
        {isRTL ? 'מייצר...' : 'generating...'}
      </span>
    </div>
  );
}

function VisualizerPreview() {
  return (
    <div className="flex items-end gap-1 mt-3 h-6">
      {[0.6, 1, 0.4, 0.8, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-sm bg-violet-400/70"
          animate={{ height: [`${h * 24}px`, `${h * 12}px`, `${h * 24}px`] }}
          transition={{ duration: 0.8 + i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function EconomyPreview() {
  return (
    <div className="flex items-center gap-2 mt-3">
      <motion.div
        className="w-6 h-6 rounded-full bg-amber-500/30 border border-amber-500/40 flex items-center justify-center"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <Coins className="h-3 w-3 text-amber-400" />
      </motion.div>
      <motion.span
        className="text-sm font-mono font-bold text-amber-400"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        1,240 MOS
      </motion.span>
    </div>
  );
}

function CoachPreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex gap-2 mt-3">
      {[
        { en: 'Find', he: 'מצא' },
        { en: 'Build', he: 'בנה' },
      ].map((label) => (
        <div key={label.en} className="px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-foreground/80">
          {isRTL ? label.he : label.en}
        </div>
      ))}
    </div>
  );
}

export default function CityShowcaseSection() {
  const { t, isRTL } = useTranslation();

  const districts = [
    {
      icon: Globe,
      title: isRTL ? '14 תחומי חיים' : '14 Life Domains',
      line: isRTL ? 'כל מימד בחיים שלך — ממופה' : 'Every dimension of your life — mapped',
      preview: <DomainIconsPreview />,
    },
    {
      icon: Fingerprint,
      title: isRTL ? 'מערכת תכונות' : 'Trait System',
      line: isRTL ? 'ה-DNA הדיגיטלי שלך כ-NFT' : 'Your digital DNA as NFT',
      preview: <TraitBadgesPreview isRTL={isRTL} />,
    },
    {
      icon: Brain,
      title: isRTL ? 'מנוע AI' : 'AI Plan Engine',
      line: isRTL ? 'תוכנית 100 יום — נבנית בשבילך' : '100-day plan — built for you',
      preview: <PlanPulsePreview isRTL={isRTL} />,
    },
    {
      icon: Headphones,
      title: isRTL ? 'מנוע היפנוזה' : 'Hypnosis Engine',
      line: isRTL ? 'סשנים מותאמים אישית' : 'Personalized sessions',
      preview: <VisualizerPreview />,
    },
    {
      icon: Coins,
      title: isRTL ? 'כלכלת MOS' : 'MOS Economy',
      line: isRTL ? 'שחק, הרוויח, שלוט' : 'Play, earn, dominate',
      preview: <EconomyPreview />,
    },
    {
      icon: Users,
      title: isRTL ? 'שוק מאמנים' : 'Coach Marketplace',
      line: isRTL ? 'מצא או בנה עסק אימון' : 'Find or build a coaching biz',
      preview: <CoachPreview />,
    },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'האימפריה שלך' : 'Your Empire'}
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            {isRTL ? 'כל אימפריה צריכה תשתית.' : 'Every empire needs infrastructure.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {districts.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={cn(
                  'relative p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-sm',
                  'cursor-default transition-shadow duration-300',
                  'hover:shadow-lg hover:shadow-primary/10',
                  DISTRICT_COLORS[i]
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-black text-foreground text-sm">{d.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{d.line}</p>
                {d.preview}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
