import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Megaphone, Settings, Lightbulb, Palette, TrendingUp, Headphones, Calendar } from "lucide-react";

interface BusinessToolsGridProps {
  language: string;
  onOpenModal?: (modalType: string) => void;
}

const BusinessToolsGrid = ({ language, onOpenModal }: BusinessToolsGridProps) => {
  const navigate = useNavigate();

  const businessTools = [
    {
      id: 'financials',
      icon: DollarSign,
      titleHe: 'פיננסים',
      titleEn: 'Financials',
      descHe: 'תקציב, הכנסות והוצאות',
      descEn: 'Budget, revenue and expenses',
      onClick: () => onOpenModal?.('financials'),
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
    },
    {
      id: 'marketing',
      icon: Megaphone,
      titleHe: 'שיווק',
      titleEn: 'Marketing',
      descHe: 'אסטרטגיות וערוצים שיווקיים',
      descEn: 'Strategies and marketing channels',
      onClick: () => onOpenModal?.('marketing'),
      gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
    },
    {
      id: 'operations',
      icon: Settings,
      titleHe: 'תפעול',
      titleEn: 'Operations',
      descHe: 'ניהול יומיומי ותהליכים',
      descEn: 'Daily management and processes',
      onClick: () => onOpenModal?.('operations'),
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
    },
    {
      id: 'strategy',
      icon: Lightbulb,
      titleHe: 'אסטרטגיה',
      titleEn: 'Strategy',
      descHe: 'תכנון ואסטרטגיה עסקית',
      descEn: 'Business planning and strategy',
      onClick: () => onOpenModal?.('strategy'),
      gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/50',
    },
    {
      id: 'branding',
      icon: Palette,
      titleHe: 'מיתוג',
      titleEn: 'Branding',
      descHe: 'זהות מותג ומיצוב',
      descEn: 'Brand identity and positioning',
      onClick: () => onOpenModal?.('branding'),
      gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      borderColor: 'border-pink-500/20 hover:border-pink-500/50',
    },
    {
      id: 'growth',
      icon: TrendingUp,
      titleHe: 'צמיחה',
      titleEn: 'Growth',
      descHe: 'מדדי צמיחה ויעדים',
      descEn: 'Growth metrics and goals',
      onClick: () => onOpenModal?.('growth'),
      gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20 hover:border-green-500/50',
    },
    {
      id: 'hypnosis',
      icon: Headphones,
      titleHe: 'היפנוזה עסקית',
      titleEn: 'Business Hypnosis',
      descHe: 'סשנים ממוקדי עסקים',
      descEn: 'Business-focused sessions',
      onClick: () => navigate('/hypnosis?goal=business'),
      gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20 hover:border-yellow-500/50',
    },
    {
      id: '90-day-plan',
      icon: Calendar,
      titleHe: 'תוכנית 90 יום',
      titleEn: '90-Day Plan',
      descHe: 'מפת דרכים אסטרטגית',
      descEn: 'Strategic roadmap',
      onClick: () => navigate('/life-plan'),
      gradient: 'from-orange-500/20 via-red-500/10 to-transparent',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20 hover:border-orange-500/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {businessTools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`relative overflow-hidden backdrop-blur-xl bg-gray-900/60 ${tool.borderColor} cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 group`}
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
                  <h3 className="font-semibold text-xs text-foreground leading-tight">
                    {language === 'he' ? tool.titleHe : tool.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
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

export default BusinessToolsGrid;
