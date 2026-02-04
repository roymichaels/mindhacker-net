import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Briefcase, 
  Heart, 
  Users, 
  Wallet, 
  GraduationCap, 
  Compass,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const pillars = [
  {
    id: 'personality',
    icon: User,
    titleHe: 'אישיות',
    titleEn: 'Personality',
    descriptionHe: 'גלה מי אתה באמת',
    descriptionEn: 'Discover who you truly are',
    gradient: 'from-blue-500 to-cyan-400',
    shadowColor: 'shadow-blue-500/25',
    bgGlow: 'bg-blue-500/30',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'business',
    icon: Briefcase,
    titleHe: 'עסקים',
    titleEn: 'Business',
    descriptionHe: 'בנה את האימפריה שלך',
    descriptionEn: 'Build your empire',
    gradient: 'from-amber-500 to-yellow-400',
    shadowColor: 'shadow-amber-500/25',
    bgGlow: 'bg-amber-500/30',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'health',
    icon: Heart,
    titleHe: 'בריאות',
    titleEn: 'Health',
    descriptionHe: 'גוף, נפש ואנרגיה',
    descriptionEn: 'Body, mind & energy',
    gradient: 'from-red-500 to-rose-400',
    shadowColor: 'shadow-red-500/25',
    bgGlow: 'bg-red-500/30',
    borderColor: 'border-red-500/30',
  },
  {
    id: 'relationships',
    icon: Users,
    titleHe: 'מערכות יחסים',
    titleEn: 'Relationships',
    descriptionHe: 'קשרים עמוקים יותר',
    descriptionEn: 'Deeper connections',
    gradient: 'from-pink-500 to-rose-400',
    shadowColor: 'shadow-pink-500/25',
    bgGlow: 'bg-pink-500/30',
    borderColor: 'border-pink-500/30',
  },
  {
    id: 'finances',
    icon: Wallet,
    titleHe: 'פיננסים',
    titleEn: 'Finances',
    descriptionHe: 'שלוט בכסף שלך',
    descriptionEn: 'Master your money',
    gradient: 'from-emerald-500 to-green-400',
    shadowColor: 'shadow-emerald-500/25',
    bgGlow: 'bg-emerald-500/30',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'learning',
    icon: GraduationCap,
    titleHe: 'למידה',
    titleEn: 'Learning',
    descriptionHe: 'צמח כל יום',
    descriptionEn: 'Grow every day',
    gradient: 'from-indigo-500 to-violet-400',
    shadowColor: 'shadow-indigo-500/25',
    bgGlow: 'bg-indigo-500/30',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'purpose',
    icon: Compass,
    titleHe: 'ייעוד',
    titleEn: 'Purpose',
    descriptionHe: 'מצא את המשמעות',
    descriptionEn: 'Find your meaning',
    gradient: 'from-purple-500 to-fuchsia-400',
    shadowColor: 'shadow-purple-500/25',
    bgGlow: 'bg-purple-500/30',
    borderColor: 'border-purple-500/30',
  },
];

const LifePillarsSection = () => {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm">
              {isRTL ? '7 עמודי החיים' : '7 Life Pillars'}
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {isRTL ? 'מערכת ההפעלה המלאה לחיים שלך' : 'Your Complete Life Operating System'}
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {isRTL 
              ? 'שבעה תחומים קריטיים. מערכת אחת משולבת. טרנספורמציה אמיתית.'
              : 'Seven critical domains. One integrated system. Real transformation.'}
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
        >
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className={`
                  relative group cursor-pointer
                  ${index === 6 ? 'col-span-2 md:col-span-1 md:col-start-2 lg:col-start-auto lg:col-span-1' : ''}
                `}
              >
                {/* Card */}
                <div className={cn(
                  "relative h-full p-6 rounded-2xl",
                  "bg-card/60 backdrop-blur-xl",
                  "border-2",
                  pillar.borderColor,
                  "hover:shadow-xl transition-all duration-300",
                  "overflow-hidden",
                  pillar.shadowColor
                )}>
                  {/* Glow Effect */}
                  <div className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl",
                    "opacity-0 group-hover:opacity-80 transition-opacity duration-500",
                    pillar.bgGlow
                  )} />
                  
                  {/* Icon */}
                  <motion.div 
                    className={cn(
                      "relative z-10 w-14 h-14 rounded-xl mb-4",
                      "bg-gradient-to-br flex items-center justify-center",
                      "shadow-lg",
                      pillar.gradient,
                      pillar.shadowColor
                    )}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1.5 text-foreground">
                      {isRTL ? pillar.titleHe : pillar.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {isRTL ? pillar.descriptionHe : pillar.descriptionEn}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className={cn(
                    "absolute bottom-4 text-primary opacity-0 group-hover:opacity-100",
                    "transition-all duration-300 transform",
                    isRTL ? "left-4 group-hover:translate-x-[-4px]" : "right-4 group-hover:translate-x-[4px]"
                  )}>
                    <ArrowRight className={cn("h-5 w-5", isRTL && "rotate-180")} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/free-journey')}
            className="
              relative overflow-hidden
              bg-gradient-to-r from-primary via-primary to-primary-foreground/90
              hover:from-primary/90 hover:to-primary
              text-primary-foreground font-bold
              px-8 py-6 text-lg
              shadow-lg shadow-primary/25
              transition-all duration-300
              hover:scale-105
            "
          >
            <span className="relative z-10">
              {isRTL ? 'התחל את המסע שלך' : 'Start Your Journey'}
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            {isRTL ? 'חינם לחלוטין • ללא כרטיס אשראי' : 'Completely free • No credit card required'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LifePillarsSection;
