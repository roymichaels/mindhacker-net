import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Megaphone, Settings, Lightbulb, Palette, TrendingUp, Headphones, Calendar } from "lucide-react";
 import { useTranslation } from "@/hooks/useTranslation";

interface BusinessToolsGridProps {
  onOpenModal?: (modalType: string) => void;
}

 const BusinessToolsGrid = ({ onOpenModal }: BusinessToolsGridProps) => {
  const navigate = useNavigate();
   const { t } = useTranslation();

  const businessTools = [
    {
      id: 'financials',
      icon: DollarSign,
       title: t('businessHub.tools.financials'),
       desc: t('businessHub.tools.financialsDesc'),
      onClick: () => onOpenModal?.('financials'),
      gradient: 'from-emerald-500/30 via-green-500/20 to-transparent dark:from-emerald-500/20 dark:via-green-500/10 dark:to-transparent',
      iconBg: 'bg-emerald-500/30 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60 dark:border-emerald-500/20 dark:hover:border-emerald-500/50',
    },
    {
      id: 'marketing',
      icon: Megaphone,
       title: t('businessHub.tools.marketing'),
       desc: t('businessHub.tools.marketingDesc'),
      onClick: () => onOpenModal?.('marketing'),
      gradient: 'from-purple-500/30 via-violet-500/20 to-transparent dark:from-purple-500/20 dark:via-violet-500/10 dark:to-transparent',
      iconBg: 'bg-purple-500/30 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60 dark:border-purple-500/20 dark:hover:border-purple-500/50',
    },
    {
      id: 'operations',
      icon: Settings,
       title: t('businessHub.tools.operations'),
       desc: t('businessHub.tools.operationsDesc'),
      onClick: () => onOpenModal?.('operations'),
      gradient: 'from-amber-500/30 via-yellow-500/20 to-transparent dark:from-amber-500/20 dark:via-yellow-500/10 dark:to-transparent',
      iconBg: 'bg-amber-500/30 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60 dark:border-amber-500/20 dark:hover:border-amber-500/50',
    },
    {
      id: 'strategy',
      icon: Lightbulb,
       title: t('businessHub.tools.strategy'),
       desc: t('businessHub.tools.strategyDesc'),
      onClick: () => onOpenModal?.('strategy'),
      gradient: 'from-cyan-500/30 via-teal-500/20 to-transparent dark:from-cyan-500/20 dark:via-teal-500/10 dark:to-transparent',
      iconBg: 'bg-cyan-500/30 dark:bg-cyan-500/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60 dark:border-cyan-500/20 dark:hover:border-cyan-500/50',
    },
    {
      id: 'branding',
      icon: Palette,
       title: t('businessHub.tools.branding'),
       desc: t('businessHub.tools.brandingDesc'),
      onClick: () => onOpenModal?.('branding'),
      gradient: 'from-pink-500/30 via-rose-500/20 to-transparent dark:from-pink-500/20 dark:via-rose-500/10 dark:to-transparent',
      iconBg: 'bg-pink-500/30 dark:bg-pink-500/20',
      iconColor: 'text-pink-600 dark:text-pink-400',
      borderColor: 'border-pink-500/30 hover:border-pink-500/60 dark:border-pink-500/20 dark:hover:border-pink-500/50',
    },
    {
      id: 'growth',
      icon: TrendingUp,
       title: t('businessHub.tools.growth'),
       desc: t('businessHub.tools.growthDesc'),
      onClick: () => onOpenModal?.('growth'),
      gradient: 'from-green-500/30 via-emerald-500/20 to-transparent dark:from-green-500/20 dark:via-emerald-500/10 dark:to-transparent',
      iconBg: 'bg-green-500/30 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-500/30 hover:border-green-500/60 dark:border-green-500/20 dark:hover:border-green-500/50',
    },
    {
      id: 'hypnosis',
      icon: Headphones,
       title: t('businessHub.tools.hypnosis'),
       desc: t('businessHub.tools.hypnosisDesc'),
      onClick: () => navigate('/hypnosis?goal=business'),
      gradient: 'from-yellow-500/30 via-amber-500/20 to-transparent dark:from-yellow-500/20 dark:via-amber-500/10 dark:to-transparent',
      iconBg: 'bg-yellow-500/30 dark:bg-yellow-500/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-500/30 hover:border-yellow-500/60 dark:border-yellow-500/20 dark:hover:border-yellow-500/50',
    },
    {
      id: '90-day-plan',
      icon: Calendar,
       title: t('businessHub.tools.plan90Day'),
       desc: t('businessHub.tools.plan90DayDesc'),
      onClick: () => navigate('/plan'),
      gradient: 'from-orange-500/30 via-red-500/20 to-transparent dark:from-orange-500/20 dark:via-red-500/10 dark:to-transparent',
      iconBg: 'bg-orange-500/30 dark:bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-500/30 hover:border-orange-500/60 dark:border-orange-500/20 dark:hover:border-orange-500/50',
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
            className={`relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/60 ${tool.borderColor} cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5 group`}
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
                       {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                       {tool.desc}
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
