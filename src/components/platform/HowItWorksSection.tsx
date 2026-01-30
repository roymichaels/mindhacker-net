import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  ClipboardCheck, 
  Route, 
  Rocket,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

const HowItWorksSection = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: t('platform.step1Title'),
      description: t('platform.step1Desc'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
    {
      number: 2,
      icon: ClipboardCheck,
      title: t('platform.step2Title'),
      description: t('platform.step2Desc'),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/30',
    },
    {
      number: 3,
      icon: Route,
      title: t('platform.step3Title'),
      description: t('platform.step3Desc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
    },
    {
      number: 4,
      icon: Rocket,
      title: t('platform.step4Title'),
      description: t('platform.step4Desc'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
  ];

  return (
    <section 
      className="py-16 sm:py-24 px-4 bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('platform.howItWorksTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('platform.howItWorksSubtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl ${step.bgColor} border ${step.borderColor}`}
            >
              {/* Step number */}
              <div className={`absolute -top-3 ${isRTL ? '-right-3' : '-left-3'} w-8 h-8 rounded-full ${step.bgColor} border-2 ${step.borderColor} flex items-center justify-center`}>
                <span className={`text-sm font-bold ${step.color}`}>{step.number}</span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`hidden lg:block absolute top-1/2 ${isRTL ? '-left-6' : '-right-6'} w-6 h-0.5 bg-border`} />
              )}

              <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>

              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            onClick={() => navigate('/signup')}
          >
            {t('platform.getStartedFree')}
            <ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            {t('platform.noCardRequired')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
