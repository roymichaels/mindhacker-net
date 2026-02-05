import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BarChart3, Users, Zap, Target, X } from "lucide-react";
import { motion } from "framer-motion";
 import { useTranslation } from "@/hooks/useTranslation";

interface GrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

 const GrowthModal = ({ isOpen, onClose }: GrowthModalProps) => {
   const { t } = useTranslation();

  const growthMetrics = [
    {
      id: 'revenue-growth',
      icon: BarChart3,
       label: t('businessHub.modals.growth.revenueGrowth'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'customer-growth',
      icon: Users,
       label: t('businessHub.modals.growth.customerGrowth'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'momentum',
      icon: Zap,
       label: t('businessHub.modals.growth.momentum'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      id: 'goals',
      icon: Target,
       label: t('businessHub.modals.growth.goalAchievement'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-background to-muted dark:from-gray-950 dark:to-gray-900 border-border dark:border-green-800/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
             {t('businessHub.modals.growth.title')}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Overall Growth Score */}
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-400/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                   {t('businessHub.modals.growth.growthRate')}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-bold text-green-400">--</span>
                </div>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {growthMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${metric.bgColor} border-border/30 h-full`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <p className={`font-semibold ${metric.color}`}>
                      {metric.valueLabel}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <Card className="bg-background/60 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                 {t('businessHub.comingSoonGrowth')}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GrowthModal;
