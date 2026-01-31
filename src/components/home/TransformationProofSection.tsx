/**
 * TransformationProofSection - Shows dramatic before/after transformation
 * with psychological triggers: social proof, loss aversion, urgency
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const beforeItems = [
  { icon: '😴', textHe: 'מרגיש תקוע באותם דפוסים', textEn: 'Feeling stuck in the same patterns' },
  { icon: '🔄', textHe: 'מסתובב באותם מעגלים', textEn: 'Going in circles' },
  { icon: '😤', textHe: 'מתוסכל מחוסר התקדמות', textEn: 'Frustrated by lack of progress' },
  { icon: '📉', textHe: 'מבזבז זמן יקר', textEn: 'Wasting precious time' },
];

const afterItems = [
  { icon: '🚀', textHe: 'בהירות מוחלטת לגבי הכיוון', textEn: 'Complete clarity on direction' },
  { icon: '⚡', textHe: 'אנרגיה ומוטיבציה גבוהה', textEn: 'High energy and motivation' },
  { icon: '🎯', textHe: 'פוקוס חד על מה שחשוב', textEn: 'Sharp focus on what matters' },
  { icon: '📈', textHe: 'התקדמות מדידה כל יום', textEn: 'Measurable progress every day' },
];

export default function TransformationProofSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/20 to-emerald-500/20 border border-primary/30 mb-6">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-foreground">
              {isRTL ? 'לפני ואחרי' : 'Before & After'}
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {isRTL ? 'זה ההבדל בין' : 'This Is The Difference Between'}
            <br />
            <span className="text-red-400">{isRTL ? 'להישאר תקוע' : 'Staying Stuck'}</span>
            {' '}
            <span className="text-muted-foreground">{isRTL ? 'לבין' : 'vs'}</span>
            {' '}
            <span className="text-emerald-400">{isRTL ? 'להתקדם' : 'Breaking Through'}</span>
          </h2>
        </motion.div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* BEFORE - Pain State */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-900/20 border-2 border-red-500/30"
          >
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
              {isRTL ? '😔 לפני' : '😔 Before'}
            </div>
            
            <div className="mt-4 space-y-4">
              {beforeItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-red-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-foreground/80">
                    {isRTL ? item.textHe : item.textEn}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Time wasted message */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-center"
            >
              <p className="text-red-300 font-bold">
                {isRTL 
                  ? '⏰ כל יום שעובר = יום שלא תחזור אליו'
                  : '⏰ Every passing day = a day you never get back'
                }
              </p>
            </motion.div>
          </motion.div>

          {/* AFTER - Dream State */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border-2 border-emerald-500/30"
          >
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold">
              {isRTL ? '🚀 אחרי' : '🚀 After'}
            </div>
            
            <div className="mt-4 space-y-4">
              {afterItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index + 0.2 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-emerald-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-foreground">
                    {isRTL ? item.textHe : item.textEn}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Success message */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center"
            >
              <p className="text-emerald-300 font-bold">
                {isRTL 
                  ? '✨ 30 יום = חיים חדשים לגמרי'
                  : '✨ 30 days = a completely new life'
                }
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Row - Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: '87%', label: isRTL ? 'מרגישים שינוי תוך שבוע' : 'feel change within a week', icon: Zap },
            { value: '23K+', label: isRTL ? 'משתמשים פעילים' : 'active users', icon: Star },
            { value: '4.9', label: isRTL ? 'דירוג ממוצע' : 'average rating', icon: Star },
            { value: '14', label: isRTL ? 'דקות ביום בממוצע' : 'min/day average', icon: Clock },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="p-4 rounded-2xl bg-card border border-border/50 text-center hover:border-primary/30 transition-colors"
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
