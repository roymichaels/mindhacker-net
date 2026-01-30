import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import MockDashboard from './MockDashboard';
import { cn } from '@/lib/utils';

export default function DashboardPreviewSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Monitor className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Dashboard</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            {t('home.dashboardTitle')}
          </h2>
        </motion.div>

        {/* Dashboard Preview with Browser Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Browser Frame */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl">
            {/* Browser Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4">
                <div className="flex items-center justify-center px-4 py-1.5 rounded-lg bg-background/50 text-xs text-muted-foreground">
                  mindhacker.net/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 bg-gradient-to-br from-background to-muted/20">
              <MockDashboard animate={true} />
            </div>
          </div>
        </motion.div>

        {/* CTA - Game-style glowing button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="group text-lg px-10 py-7 rounded-2xl 
              bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600
              hover:from-cyan-300 hover:via-cyan-400 hover:to-cyan-500
              text-cyan-950 font-bold
              shadow-[0_0_25px_rgba(34,211,238,0.5),0_8px_20px_rgba(0,0,0,0.2)]
              hover:shadow-[0_0_35px_rgba(34,211,238,0.7),0_12px_30px_rgba(0,0,0,0.3)]
              border-2 border-cyan-200/40
              transition-all duration-300 hover:scale-105"
          >
            {t('home.dashboardCta')}
            <ArrowRight className={cn(
              "h-5 w-5 transition-transform group-hover:translate-x-1",
              isRTL ? "mr-2 rotate-180 group-hover:-translate-x-1" : "ml-2"
            )} />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            {isRTL ? '🎮 התחל את המשחק שלך עכשיו' : '🎮 Start your game now'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
