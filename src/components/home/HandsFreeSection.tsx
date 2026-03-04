/**
 * HandsFreeSection - Showcasing the voice-first, chat-centric experience
 * Everything happens through Aurora - no navigation needed
 */

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Mic, 
  MessageCircle, 
  CheckCircle2, 
  Plus,
  Sparkles,
  Volume2,
  Brain,
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const HandsFreeSection = () => {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  const chatExamples = [
    { type: 'user', text: '🎤 "Aurora, remind me tomorrow morning to send the proposal"', isVoice: true },
    { type: 'aurora', text: '✅ Created a reminder for tomorrow at 8:00 AM. Also added a task to your 100-day plan.' },
    { type: 'user', text: '🎤 "What\'s my status today?"', isVoice: true },
    { type: 'aurora', text: '📊 Today you completed 3 of 5 tasks. Your streak: 21 days! 🔥 Next task: 30-minute workout.' },
    { type: 'user', text: '🎤 "I finished the workout"', isVoice: true },
    { type: 'aurora', text: '🎉 Awesome! Marked as complete. You earned +50 XP! Now you\'re level 48. Want a recovery hypnosis session?' },
  ];

  // For Hebrew, override texts
  const chatExamplesHe = [
    { type: 'user', text: '🎤 "אורורה, תזכירי לי מחר בבוקר לשלוח את ההצעה"', isVoice: true },
    { type: 'aurora', text: '✅ נוצרה תזכורת למחר ב-8:00 בבוקר. גם הוספתי משימה לתוכנית ה-100 יום שלך.' },
    { type: 'user', text: '🎤 "מה המצב שלי היום?"', isVoice: true },
    { type: 'aurora', text: '📊 היום השלמת 3 מתוך 5 משימות. הסטריק שלך: 21 יום! 🔥 המשימה הבאה: אימון של 30 דקות.' },
    { type: 'user', text: '🎤 "סיימתי את האימון"', isVoice: true },
    { type: 'aurora', text: '🎉 מעולה! סימנתי כהושלם. קיבלת +50 XP! עכשיו אתה ברמה 48. רוצה סשן היפנוזה להתאוששות?' },
  ];

  const msgs = isRTL ? chatExamplesHe : chatExamples;

  const capabilities = [
    { icon: Plus, text: t('home.handsFree.createTasks'), gradient: 'from-emerald-500 to-green-400' },
    { icon: CheckCircle2, text: t('home.handsFree.markComplete'), gradient: 'from-blue-500 to-cyan-400' },
    { icon: Brain, text: t('home.handsFree.hypnosisSession'), gradient: 'from-purple-500 to-violet-400' },
    { icon: Zap, text: t('home.handsFree.checkProgress'), gradient: 'from-amber-500 to-yellow-400' },
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Mic className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm">
              {t('home.handsFree.badge')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-5">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('home.handsFree.title')}
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('home.handsFree.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-2xl opacity-60" />
              <div className="relative bg-card/90 backdrop-blur-xl rounded-[2.5rem] border-2 border-border/50 p-4 shadow-2xl">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
                <div className="mt-6 space-y-3 max-h-[400px] overflow-hidden">
                  {msgs.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                      className={cn(
                        "flex",
                        msg.type === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm",
                        msg.type === 'user' 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-muted border border-border/50 rounded-bl-sm",
                        msg.isVoice && "border-2 border-primary/30"
                      )}>
                        {msg.isVoice && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                              <Mic className="h-3 w-3 text-primary-foreground/80" />
                            </motion.div>
                            <span className="text-xs text-primary-foreground/70">
                              {t('home.handsFree.voiceMessage')}
                            </span>
                          </div>
                        )}
                        <p className={cn(msg.type === 'aurora' && "text-foreground")}>{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 border border-border/30">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">
                    {t('home.handsFree.typeOrRecord')}
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Mic className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold">
                {t('home.handsFree.chatTitle')}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('home.handsFree.chatDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {capabilities.map((cap, index) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br", cap.gradient)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm">{cap.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{t('home.handsFree.voiceTitle')}</h4>
                  <p className="text-sm text-muted-foreground">{t('home.handsFree.voiceDesc')}</p>
                </div>
              </div>
            </motion.div>

            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-8 py-6 text-lg shadow-lg shadow-primary/25"
            >
              <span>{t('home.handsFree.cta')}</span>
              <ArrowRight className={cn("w-5 h-5 ms-2", isRTL && "rotate-180")} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HandsFreeSection;
