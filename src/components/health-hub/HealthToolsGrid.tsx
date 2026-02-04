import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Brain, Zap, Sparkles, Headphones, Target, Wind, Moon } from "lucide-react";

interface HealthToolsGridProps {
  language: string;
  onOpenModal?: (modalType: string) => void;
}

const HealthToolsGrid = ({ language, onOpenModal }: HealthToolsGridProps) => {
  const navigate = useNavigate();

  const healthTools = [
    {
      id: 'physical',
      icon: Activity,
      titleHe: 'בריאות פיזית',
      titleEn: 'Physical Health',
      descHe: 'תזונה, שינה ופעילות גופנית',
      descEn: 'Nutrition, sleep and physical activity',
      onClick: () => onOpenModal?.('physical'),
      gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20 hover:border-rose-500/50',
    },
    {
      id: 'mental',
      icon: Brain,
      titleHe: 'בריאות נפשית',
      titleEn: 'Mental Health',
      descHe: 'ניהול מתח, רגשות וחוסן נפשי',
      descEn: 'Stress management, emotions and resilience',
      onClick: () => onOpenModal?.('mental'),
      gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
    },
    {
      id: 'energetic',
      icon: Zap,
      titleHe: 'בריאות אנרגטית',
      titleEn: 'Energy Health',
      descHe: 'רמות אנרגיה, חיוניות והתאוששות',
      descEn: 'Energy levels, vitality and recovery',
      onClick: () => onOpenModal?.('energetic'),
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
    },
    {
      id: 'subconscious',
      icon: Sparkles,
      titleHe: 'תת-מודע',
      titleEn: 'Subconscious',
      descHe: 'אמונות מגבילות ודפוסים נסתרים',
      descEn: 'Limiting beliefs and hidden patterns',
      onClick: () => onOpenModal?.('subconscious'),
      gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/50',
    },
    {
      id: 'hypnosis',
      icon: Headphones,
      titleHe: 'היפנוזה לבריאות',
      titleEn: 'Health Hypnosis',
      descHe: 'סשנים ממוקדי בריאות',
      descEn: 'Health-focused sessions',
      onClick: () => navigate('/hypnosis?goal=health'),
      gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20 hover:border-red-500/50',
    },
    {
      id: 'habits',
      icon: Target,
      titleHe: 'הרגלים',
      titleEn: 'Habits',
      descHe: 'מעקב הרגלי בריאות יומיים',
      descEn: 'Daily health habits tracking',
      onClick: () => onOpenModal?.('habits'),
      gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20 hover:border-green-500/50',
    },
    {
      id: 'meditation',
      icon: Wind,
      titleHe: 'מדיטציה ונשימה',
      titleEn: 'Meditation & Breathing',
      descHe: 'תרגולי הרפיה ומיינדפולנס',
      descEn: 'Relaxation and mindfulness practices',
      onClick: () => onOpenModal?.('meditation'),
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    },
    {
      id: 'sleep',
      icon: Moon,
      titleHe: 'שינה',
      titleEn: 'Sleep',
      descHe: 'איכות ודפוסי שינה',
      descEn: 'Sleep quality and patterns',
      onClick: () => onOpenModal?.('sleep'),
      gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {healthTools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`relative overflow-hidden backdrop-blur-xl bg-gray-900/60 ${tool.borderColor} cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 group`}
            onClick={tool.onClick}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-50 group-hover:opacity-80 transition-opacity`} />
            
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${tool.iconBg} backdrop-blur-sm`}>
                  <tool.icon className={`h-5 w-5 ${tool.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {language === 'he' ? tool.titleHe : tool.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {language === 'he' ? tool.descHe : tool.descEn}
                  </p>
                </div>
                <ArrowRight className={`h-4 w-4 ${tool.iconColor} opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default HealthToolsGrid;
