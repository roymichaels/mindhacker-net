import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Calendar, 
  CheckSquare, 
  Target, 
  Lightbulb, 
  Bell,
  MessageCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const chatFeatures = [
  { icon: ClipboardList, key: 'Tasks', exampleKey: 'chatTasksExample', color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
  { icon: Calendar, key: 'Schedule', exampleKey: 'chatScheduleExample', color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400' },
  { icon: CheckSquare, key: 'Checklists', exampleKey: 'chatChecklistsExample', color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400' },
  { icon: Target, key: 'Goals', exampleKey: 'chatGoalsExample', color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400' },
  { icon: Lightbulb, key: 'Insights', exampleKey: 'chatInsightsExample', color: 'from-yellow-500/20 to-yellow-600/10', iconColor: 'text-yellow-400' },
  { icon: Bell, key: 'Reminders', exampleKey: 'chatRemindersExample', color: 'from-pink-500/20 to-pink-600/10', iconColor: 'text-pink-400' },
];

export default function ChatManagesEverythingSection() {
  const { t, isRTL } = useTranslation();

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
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Aurora Chat</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.chatTitle')}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.chatSubtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {chatFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={cn(
                  "relative p-5 rounded-2xl border border-border/50",
                  "bg-gradient-to-br backdrop-blur-sm",
                  feature.color,
                  "cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    "bg-background/50"
                  )}>
                    <Icon className={cn("h-5 w-5", feature.iconColor)} />
                  </div>
                  <h3 className="font-semibold">
                    {t(`home.chat${feature.key}`)}
                  </h3>
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  {t(`home.${feature.exampleKey}`)}
                </p>

                {/* Decorative quote marks */}
                <div className="absolute top-2 right-3 text-4xl text-muted-foreground/20 font-serif">
                  "
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
