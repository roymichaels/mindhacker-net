/**
 * AuroraCoachSection - Aurora AI with HoloOrb + chat preview + feature bullets
 */
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Bot, Mic, Brain, Headphones } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { cn } from '@/lib/utils';

const auroraFeatures = [
  { icon: Bot, titleHe: 'אימון 24/7', titleEn: '24/7 Coaching', descHe: 'תמיד שם, תמיד מותאם', descEn: 'Always there, always adapted' },
  { icon: Mic, titleHe: 'קול לטקסט', titleEn: 'Voice-to-Text', descHe: 'דבר במקום לכתוב', descEn: 'Talk instead of typing' },
  { icon: Brain, titleHe: 'זיכרון מלא', titleEn: 'Full Memory', descHe: 'זוכרת כל שיחה ודפוס', descEn: 'Remembers every conversation & pattern' },
  { icon: Headphones, titleHe: 'סשני היפנוזה', titleEn: 'Hypnosis Sessions', descHe: 'נוצרים בזמן אמת מהשיחה', descEn: 'Generated in real time from your chat' },
];

const conversationExamples = [
  { he: 'שמתי לב שהאנרגיה שלך נמוכה השבוע. בוא נבדוק מה השתנה בשינה...', en: "I noticed your energy dropped this week. Let's check what changed in your sleep..." },
  { he: 'ההתמדה שלך בלחימה עלתה ב-40% החודש! זה משפיע גם על הביטחון העצמי.', en: 'Your combat consistency is up 40% this month! This is also boosting your confidence.' },
  { he: 'רוצה שאכין לך סשן היפנוזה למיקוד לפני הפגישה העסקית מחר?', en: 'Want me to prepare a focus hypnosis session before your business meeting tomorrow?' },
];

export default function AuroraCoachSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-900/50 dark:via-gray-950/30 dark:to-transparent overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Aurora HoloOrb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
                style={{ width: 300, height: 300, left: -30, top: -30 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <AuroraHoloOrb size={240} glow="full" />
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {isRTL ? 'הכירו את Aurora' : 'Meet Aurora'}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {isRTL ? 'המאמנת שמכירה אותך' : 'The Coach That Knows You'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {isRTL
                  ? 'Aurora מבינה את כל התמונה — גוף, נפש, עסקים, יחסים — ויודעת לחבר ביניהם.'
                  : 'Aurora sees the full picture — body, mind, business, relationships — and connects them.'}
              </p>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-2 gap-3">
              {auroraFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                  >
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{isRTL ? f.titleHe : f.titleEn}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? f.descHe : f.descEn}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Chat preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                {isRTL ? 'Aurora יודעת לומר:' : 'Aurora knows how to say:'}
              </h3>
              <div className="space-y-2">
                {conversationExamples.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
                    className="flex items-start gap-2.5"
                  >
                    <AuroraHoloOrb size={24} glow="subtle" animate={false} className="mt-1 shrink-0" />
                    <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/80 italic">
                      {isRTL ? ex.he : ex.en}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
