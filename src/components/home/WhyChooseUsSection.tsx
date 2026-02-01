import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  Brain, 
  Zap, 
  Map, 
  Sparkles, 
  LayoutDashboard,
  Trophy,
  TrendingUp,
  Gift,
  Repeat
} from "lucide-react";

const WhyChooseUsSection = () => {
  const { t, isRTL } = useTranslation();

  const valueProps = [
    {
      icon: Headphones,
      titleKey: "home.whyChooseUs.hypnotherapist.title",
      descKey: "home.whyChooseUs.hypnotherapist.desc",
      gradient: "from-purple-500 to-pink-500",
      shadowColor: "shadow-purple-500/20",
    },
    {
      icon: Brain,
      titleKey: "home.whyChooseUs.coach.title",
      descKey: "home.whyChooseUs.coach.desc",
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/20",
    },
    {
      icon: Zap,
      titleKey: "home.whyChooseUs.productivity.title",
      descKey: "home.whyChooseUs.productivity.desc",
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
    {
      icon: Map,
      titleKey: "home.whyChooseUs.strategy.title",
      descKey: "home.whyChooseUs.strategy.desc",
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      icon: Sparkles,
      titleKey: "home.whyChooseUs.avatar.title",
      descKey: "home.whyChooseUs.avatar.desc",
      gradient: "from-violet-500 to-purple-500",
      shadowColor: "shadow-violet-500/20",
    },
    {
      icon: LayoutDashboard,
      titleKey: "home.whyChooseUs.dashboard.title",
      descKey: "home.whyChooseUs.dashboard.desc",
      gradient: "from-rose-500 to-red-500",
      shadowColor: "shadow-rose-500/20",
    },
  ];

  const dopaminePoints = [
    {
      icon: Trophy,
      textKey: "home.whyChooseUs.dopamine.xp",
    },
    {
      icon: TrendingUp,
      textKey: "home.whyChooseUs.dopamine.levels",
    },
    {
      icon: Gift,
      textKey: "home.whyChooseUs.dopamine.achievements",
    },
    {
      icon: Repeat,
      textKey: "home.whyChooseUs.dopamine.comeback",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section 
      className="relative py-20 sm:py-24 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-900/50 dark:via-gray-950/30 dark:to-transparent overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm">
            {t("home.whyChooseUs.badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("home.whyChooseUs.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.whyChooseUs.subtitle")}
          </p>
        </motion.div>

        {/* Value Props Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16"
        >
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03, 
                transition: { duration: 0.2 } 
              }}
              className={`
                relative group p-6 rounded-2xl
                bg-card/60 backdrop-blur-sm
                border border-border/50
                hover:border-primary/40
                transition-all duration-300
                hover:shadow-xl ${prop.shadowColor}
              `}
            >
              {/* Icon with gradient background */}
              <div className={`
                w-14 h-14 rounded-xl mb-4
                bg-gradient-to-br ${prop.gradient}
                flex items-center justify-center
                shadow-lg group-hover:shadow-xl
                transition-shadow duration-300
              `}>
                <prop.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t(prop.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(prop.descKey)}
              </p>

              {/* Hover glow effect */}
              <div className={`
                absolute inset-0 rounded-2xl opacity-0 
                group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-br ${prop.gradient} blur-xl -z-10
                scale-90
              `} style={{ opacity: 0.05 }} />
            </motion.div>
          ))}
        </motion.div>

        {/* Dopamine Sub-section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative p-6 sm:p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-50 -z-10" />
          
          <div className="text-center mb-6">
            <Badge className="mb-3 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-sm font-medium">
              🔥 {t("home.whyChooseUs.dopamine.badge")}
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("home.whyChooseUs.dopamine.title")}
            </h3>
          </div>

          {/* Dopamine points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dopaminePoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t(point.textKey)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
