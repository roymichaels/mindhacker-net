import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Megaphone, TrendingUp, Users, Globe, Share2, X } from "lucide-react";
import { motion } from "framer-motion";
 import { useTranslation } from "@/hooks/useTranslation";

interface MarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

 const MarketingModal = ({ isOpen, onClose }: MarketingModalProps) => {
   const { t } = useTranslation();

  const marketingMetrics = [
    {
      id: 'reach',
      icon: Globe,
       label: t('businessHub.modals.marketing.reach'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'engagement',
      icon: Share2,
       label: t('businessHub.modals.marketing.engagement'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      id: 'leads',
      icon: Users,
       label: t('businessHub.modals.marketing.leads'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      id: 'conversion',
      icon: TrendingUp,
       label: t('businessHub.modals.marketing.conversion'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 border-amber-800/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="flex items-center gap-2 text-purple-400">
            <Megaphone className="h-5 w-5" />
             {t('businessHub.modals.marketing.title')}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Overall Marketing Score */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-400/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                   {t('businessHub.modals.marketing.marketingPerformance')}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-lg font-bold text-purple-400">--</span>
                </div>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {marketingMetrics.map((metric, index) => (
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
                 {t('businessHub.comingSoonMarketing')}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarketingModal;
