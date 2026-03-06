/**
 * CoachOSSection — "Build Your Empire" — Coaches marketplace + business OS
 * Showcases: Find/become a coach, AI landing pages, CRM, products, 3-tier model
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, BarChart3, Globe, ShoppingBag, FileText,
  Sparkles, Search, Crown, Zap, Rocket, Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const tools = [
  { icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Layout, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

const tiers = [
  { icon: Zap, name: 'Starter', nameHe: 'סטארטר', price: '$19', clients: '10', color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/5' },
  { icon: Rocket, name: 'Growth', nameHe: 'גרות\'', price: '$49', clients: '100', color: 'text-primary', border: 'border-primary/50', bg: 'bg-primary/5', featured: true },
  { icon: Crown, name: 'Scale', nameHe: 'סקייל', price: '$99', clients: '500', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/5' },
];

export default function CoachOSSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  const toolData = [
    { title: t('home.coachOS.crmTitle'), desc: t('home.coachOS.crmDesc') },
    { title: t('home.coachOS.landingTitle'), desc: t('home.coachOS.landingDesc') },
    { title: t('home.coachOS.productsTitle'), desc: t('home.coachOS.productsDesc') },
    { title: t('home.coachOS.analyticsTitle'), desc: t('home.coachOS.analyticsDesc') },
    { title: t('home.coachOS.aiPlansTitle'), desc: t('home.coachOS.aiPlansDesc') },
    { title: t('home.coachOS.subscriptionsTitle'), desc: t('home.coachOS.subscriptionsDesc') },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-rose-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 mb-6">
            <Briefcase className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-bold text-rose-400">{t('home.coachOS.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {t('home.coachOS.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('home.coachOS.subtitle')}
          </p>
        </motion.div>

        {/* Two paths: Find a Coach / Become a Coach */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border border-sky-500/30 shadow-lg shadow-sky-500/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {isRTL ? 'מצא מאמן' : 'Find a Coach'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'Aurora ממליצה על מאמנים מתאימים' : 'Aurora matches you with the right coach'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                isRTL ? 'אשף התאמה AI בן 4 שלבים' : '4-Step AI Matching Wizard',
                isRTL ? 'קטגוריות: לייף קאוצ\'ינג, עסקים, בריאות' : 'Categories: Life, Business, Health',
                isRTL ? 'הזמנת פגישות ישירות מהפלטפורמה' : 'Book sessions directly from the platform',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/30">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border border-rose-500/30 shadow-lg shadow-rose-500/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {isRTL ? 'הפוך למאמן' : 'Become a Coach'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'בנה עסק שלם בתוך המערכת' : 'Build your entire business inside the system'}
                </p>
              </div>
            </div>
            {/* Tier cards */}
            <div className="space-y-2">
              {tiers.map((tier, i) => {
                const Icon = tier.icon;
                return (
                  <div key={i} className={cn(
                    'flex items-center justify-between p-2.5 rounded-xl border',
                    tier.bg, tier.border,
                    tier.featured && 'ring-1 ring-primary/30'
                  )}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', tier.color)} />
                      <span className="text-sm font-bold text-foreground">{isRTL ? tier.nameHe : tier.name}</span>
                    </div>
                    <div className="text-end">
                      <span className={cn('text-sm font-black', tier.color)}>{tier.price}<span className="text-xs text-muted-foreground">/mo</span></span>
                      <p className="text-[10px] text-muted-foreground">{tier.clients} {isRTL ? 'לקוחות' : 'clients'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* AI Landing Pages highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-3xl bg-gradient-to-r from-violet-500/5 via-card/80 to-rose-500/5 backdrop-blur border border-violet-500/20 shadow-lg mb-14"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Globe className="h-8 w-8 text-violet-400" />
            </div>
            <div className="flex-1 text-center sm:text-start">
              <h3 className="text-xl font-black text-foreground mb-1">
                {isRTL ? 'דפי נחיתה AI — בפרומפט אחד' : 'AI Landing Pages — One Prompt'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isRTL
                  ? 'תאר את השירות שלך ו-Aurora תבנה לך דף נחיתה מקצועי עם לכידת לידים, טסטימוניאלס, ו-CTA — הכל אוטומטי. בלי מעצב, בלי קוד.'
                  : 'Describe your service and Aurora builds a professional landing page with lead capture, testimonials, and CTAs — fully automated. No designer, no code.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30">
                <span className="text-xs font-bold text-violet-400">{isRTL ? 'לידים אוטומטיים' : 'Auto Leads'}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                <span className="text-xs font-bold text-rose-400">{isRTL ? 'SEO מובנה' : 'Built-in SEO'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Business tools grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolData.map((f, i) => {
            const { icon: Icon, color, bg } = tools[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-border/50 hover:border-rose-500/30 transition-colors"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
