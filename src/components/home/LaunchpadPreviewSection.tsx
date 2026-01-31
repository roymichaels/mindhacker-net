import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Hand, 
  User, 
  Sparkles, 
  Search,
  MessageCircle,
  Heart,
  Target,
  Zap,
  Calendar,
  Rocket,
  Check,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

const LaunchpadPreviewSection = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    { icon: Hand, label: t('home.step1Name') },
    { icon: User, label: t('home.step2Name') },
    { icon: Sparkles, label: t('home.step3Name') },
    { icon: Search, label: t('home.step4Name') },
    { icon: MessageCircle, label: t('home.step5Name') },
    { icon: Heart, label: t('home.step6Name') },
    { icon: Target, label: t('home.step7Name') },
    { icon: Zap, label: t('home.step8Name') },
    { icon: Calendar, label: t('home.step9Name') },
    { icon: Rocket, label: t('home.step10Name') },
  ];

  const outcomes = [
    t('home.outcome1'),
    t('home.outcome2'),
    t('home.outcome3'),
    t('home.outcome4'),
    t('home.outcome5'),
  ];

  return (
    <section 
      id="launchpad-preview"
      className="py-16 sm:py-24 px-4 bg-muted/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.transformationJourney')}
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-12" />

        {/* Outcomes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-8">
            {t('home.outcomesTitle')}
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
            {outcomes.map((outcome, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm font-medium text-start">{outcome}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            onClick={() => navigate('/launchpad')}
          >
            {t('home.launchpadCta')}
            <ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default LaunchpadPreviewSection;
