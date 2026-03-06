/**
 * GuildSection — "Join the Guild" — Community + Learning combined
 */
import { motion } from 'framer-motion';
import { Users, BookOpen, MessageSquare, Trophy, GraduationCap, Target } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export default function GuildSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 mb-6">
            <Users className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-bold text-sky-400">{t('home.guild.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {t('home.guild.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.guild.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Community card */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border border-sky-500/30 shadow-lg shadow-sky-500/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t('home.guild.communityTitle')}</h3>
                <p className="text-xs text-muted-foreground">{t('home.guild.communityDesc')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: MessageSquare, text: t('home.guild.posts') },
                { icon: Trophy, text: t('home.guild.leaderboard') },
                { icon: Users, text: t('home.guild.playerCards') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                  <item.icon className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Learning card */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t('home.guild.learningTitle')}</h3>
                <p className="text-xs text-muted-foreground">{t('home.guild.learningDesc')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: GraduationCap, text: t('home.guild.aiCourses') },
                { icon: Target, text: t('home.guild.pillarModules') },
                { icon: BookOpen, text: t('home.guild.exercises') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                  <item.icon className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
