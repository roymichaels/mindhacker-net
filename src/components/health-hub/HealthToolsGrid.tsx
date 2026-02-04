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
      available: true,
    },
    {
      id: 'mental',
      icon: Brain,
      titleHe: 'בריאות נפשית',
      titleEn: 'Mental Health',
      descHe: 'ניהול מתח, רגשות וחוסן נפשי',
      descEn: 'Stress management, emotions and resilience',
      onClick: () => onOpenModal?.('mental'),
      available: true,
    },
    {
      id: 'energetic',
      icon: Zap,
      titleHe: 'בריאות אנרגטית',
      titleEn: 'Energy Health',
      descHe: 'רמות אנרגיה, חיוניות והתאוששות',
      descEn: 'Energy levels, vitality and recovery',
      onClick: () => onOpenModal?.('energetic'),
      available: true,
    },
    {
      id: 'subconscious',
      icon: Sparkles,
      titleHe: 'תת-מודע',
      titleEn: 'Subconscious',
      descHe: 'אמונות מגבילות ודפוסים נסתרים',
      descEn: 'Limiting beliefs and hidden patterns',
      onClick: () => onOpenModal?.('subconscious'),
      available: true,
    },
    {
      id: 'hypnosis',
      icon: Headphones,
      titleHe: 'היפנוזה לבריאות',
      titleEn: 'Health Hypnosis',
      descHe: 'סשנים ממוקדי בריאות',
      descEn: 'Health-focused sessions',
      onClick: () => navigate('/hypnosis?goal=health'),
      available: true,
    },
    {
      id: 'habits',
      icon: Target,
      titleHe: 'הרגלים',
      titleEn: 'Habits',
      descHe: 'מעקב הרגלי בריאות יומיים',
      descEn: 'Daily health habits tracking',
      onClick: () => onOpenModal?.('habits'),
      available: true,
    },
    {
      id: 'meditation',
      icon: Wind,
      titleHe: 'מדיטציה ונשימה',
      titleEn: 'Meditation & Breathing',
      descHe: 'תרגולי הרפיה ומיינדפולנס',
      descEn: 'Relaxation and mindfulness practices',
      onClick: () => onOpenModal?.('meditation'),
      available: true,
    },
    {
      id: 'sleep',
      icon: Moon,
      titleHe: 'שינה',
      titleEn: 'Sleep',
      descHe: 'איכות ודפוסי שינה',
      descEn: 'Sleep quality and patterns',
      onClick: () => onOpenModal?.('sleep'),
      available: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {healthTools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * index }}
        >
          <Card 
            className={`backdrop-blur-xl bg-background/60 border-border/50 h-full transition-all hover:shadow-md ${
              tool.available ? 'cursor-pointer hover:border-emerald-500/50' : 'opacity-60'
            }`}
            onClick={() => tool.available && tool.onClick()}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${tool.available ? 'bg-gradient-to-r from-emerald-500/20 to-teal-400/20' : 'bg-muted'}`}>
                  <tool.icon className={`h-5 w-5 ${tool.available ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {language === 'he' ? tool.titleHe : tool.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'he' ? tool.descHe : tool.descEn}
                  </p>
                </div>
                {tool.available && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default HealthToolsGrid;
