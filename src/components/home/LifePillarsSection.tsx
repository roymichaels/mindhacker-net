/**
 * LifePillarsSection - Radial Wheel Layout with Central Orb
 * 7 Life Domains arranged around your digital identity
 */

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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalizedOrb from "@/components/orb/PersonalizedOrb";

const pillars = [
  {
    id: 'consciousness',
    icon: User,
    titleHe: 'תודעה',
    titleEn: 'Consciousness',
    descriptionHe: 'מפת תודעה, כרטיס זהות, תכונות',
    descriptionEn: 'Consciousness map, identity card, traits',
    gradient: 'from-blue-500 to-cyan-400',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-400',
    angle: 0,
  },
  {
    id: 'business',
    icon: Briefcase,
    titleHe: 'עסקים',
    titleEn: 'Business',
    descriptionHe: 'אורב עסקי, תוכנית 90 יום, מיתוג',
    descriptionEn: 'Business orb, 90-day plan, branding',
    gradient: 'from-amber-500 to-yellow-400',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    angle: 51.4,
  },
  {
    id: 'health',
    icon: Heart,
    titleHe: 'בריאות',
    titleEn: 'Health',
    descriptionHe: 'גוף, נפש, אנרגיה, שינה',
    descriptionEn: 'Body, mind, energy, sleep',
    gradient: 'from-red-500 to-rose-400',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-400',
    angle: 102.8,
  },
  {
    id: 'relationships',
    icon: Users,
    titleHe: 'מערכות יחסים',
    titleEn: 'Relationships',
    descriptionHe: 'קשרים, תקשורת, אינטימיות',
    descriptionEn: 'Connections, communication, intimacy',
    gradient: 'from-pink-500 to-rose-400',
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-400',
    angle: 154.3,
  },
  {
    id: 'finances',
    icon: Wallet,
    titleHe: 'פיננסים',
    titleEn: 'Finances',
    descriptionHe: 'תקציב, השקעות, חופש כלכלי',
    descriptionEn: 'Budget, investments, financial freedom',
    gradient: 'from-emerald-500 to-green-400',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    angle: 205.7,
  },
  {
    id: 'learning',
    icon: GraduationCap,
    titleHe: 'למידה',
    titleEn: 'Learning',
    descriptionHe: 'מיומנויות, ידע, התפתחות',
    descriptionEn: 'Skills, knowledge, growth',
    gradient: 'from-indigo-500 to-violet-400',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-400',
    angle: 257.1,
  },
  {
    id: 'purpose',
    icon: Compass,
    titleHe: 'ייעוד',
    titleEn: 'Purpose',
    descriptionHe: 'משמעות, ערכים, חזון',
    descriptionEn: 'Meaning, values, vision',
    gradient: 'from-purple-500 to-fuchsia-400',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-400',
    angle: 308.6,
  },
];

const LifePillarsSection = () => {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

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
            transition={{ type: "spring" as const, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm">
              {isRTL ? '7 תחומי החיים' : '7 Life Domains'}
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {isRTL ? 'מערכת אחת. שבעה תחומים. שליטה מלאה.' : 'One System. Seven Domains. Complete Mastery.'}
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {isRTL 
              ? 'כל תחומי החיים שלך מחוברים ומסונכרנים סביב הזהות הדיגיטלית שלך'
              : 'All your life domains connected and synchronized around your digital identity'}
          </p>
        </motion.div>

        {/* Radial Layout - Desktop */}
        <div className="hidden lg:block relative mx-auto" style={{ width: '700px', height: '700px' }}>
          {/* Orbital Tracks */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full border border-border/20" />
            <div className="absolute w-[350px] h-[350px] rounded-full border border-border/30" />
          </div>
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {pillars.map((pillar) => {
              const angleRad = (pillar.angle - 90) * (Math.PI / 180);
              const x2 = 350 + Math.cos(angleRad) * 220;
              const y2 = 350 + Math.sin(angleRad) * 220;
              return (
                <motion.line
                  key={pillar.id}
                  x1="350"
                  y1="350"
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              );
            })}
          </svg>
          
          {/* Central Orb - Exact center of 700x700 container */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" as const }}
            className="absolute z-20"
            style={{ 
              left: 'calc(50% - 90px)',
              top: 'calc(50% - 90px)',
              width: '180px',
              height: '180px',
            }}
          >
            {/* Outer Glow - Centered behind orb */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-72 h-72 rounded-full bg-primary/30 blur-[60px]" />
            </motion.div>
            
            {/* Inner Glow */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <div className="w-56 h-56 rounded-full bg-primary/20 blur-[40px]" />
            </motion.div>
            
            {/* The Orb - fills parent container exactly */}
            <PersonalizedOrb size={180} state="idle" className="relative z-10" />
            
            {/* Label */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-base font-semibold text-muted-foreground">
                {isRTL ? 'הזהות שלך' : 'Your Identity'}
              </span>
            </div>
          </motion.div>
          
          {/* Pillar Nodes */}
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const angleRad = (pillar.angle - 90) * (Math.PI / 180);
            const radius = 250;
            const x = 350 + Math.cos(angleRad) * radius;
            const y = 350 + Math.sin(angleRad) * radius;
            
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="absolute group cursor-pointer"
                style={{ 
                  left: x - 60, 
                  top: y - 40,
                  width: '120px'
                }}
                whileHover={{ scale: 1.1 }}
              >
                {/* Card */}
                <div className={cn(
                  "relative p-4 rounded-2xl text-center",
                  "bg-card/80 backdrop-blur-xl",
                  "border-2",
                  pillar.borderColor,
                  "hover:shadow-xl transition-all duration-300",
                  "overflow-hidden"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl mx-auto mb-2",
                    "bg-gradient-to-br flex items-center justify-center shadow-lg",
                    pillar.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-sm font-bold text-foreground">
                    {isRTL ? pillar.titleHe : pillar.titleEn}
                  </h3>
                  
                  {/* Description on Hover */}
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    whileHover={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-muted-foreground mt-1 overflow-hidden"
                  >
                    {isRTL ? pillar.descriptionHe : pillar.descriptionEn}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Grid Layout - Mobile/Tablet */}
        <div className="lg:hidden">
          {/* Central Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-10"
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-32 h-32 rounded-full bg-primary/20 blur-[30px]" />
              </motion.div>
              <PersonalizedOrb size={80} state="idle" className="relative z-10" />
            </div>
            <span className="mt-3 text-sm font-medium text-muted-foreground">
              {isRTL ? 'הזהות שלך' : 'Your Identity'}
            </span>
          </motion.div>
          
          {/* Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-2xl text-center",
                    "bg-card/80 backdrop-blur-xl",
                    "border-2",
                    pillar.borderColor,
                    "hover:scale-105 transition-transform cursor-pointer",
                    index === 6 ? "col-span-2 sm:col-span-1" : ""
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl mx-auto mb-2",
                    "bg-gradient-to-br flex items-center justify-center shadow-lg",
                    pillar.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isRTL ? pillar.titleHe : pillar.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? pillar.descriptionHe : pillar.descriptionEn}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => navigate('/free-journey')}
            className="
              relative overflow-hidden
              bg-gradient-to-r from-primary via-primary to-accent
              hover:from-primary/90 hover:to-accent/90
              text-primary-foreground font-bold
              px-8 py-6 text-lg
              shadow-lg shadow-primary/25
              transition-all duration-300
              hover:scale-105
            "
          >
            <span className="relative z-10">
              {isRTL ? 'התחל לבנות את המערכת שלך' : 'Start Building Your System'}
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            {isRTL ? 'חינם לחלוטין • בניית תוכנית אישית' : 'Completely free • Build your personal plan'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LifePillarsSection;
