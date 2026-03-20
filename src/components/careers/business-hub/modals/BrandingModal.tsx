import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Palette, TrendingUp, Image, Type, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
 import { useTranslation } from "@/hooks/useTranslation";

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

 const BrandingModal = ({ isOpen, onClose }: BrandingModalProps) => {
   const { t } = useTranslation();

  const brandingMetrics = [
    {
      id: 'identity',
      icon: Sparkles,
       label: t('businessHub.modals.branding.identity'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      id: 'visuals',
      icon: Image,
       label: t('businessHub.modals.branding.visuals'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'typography',
      icon: Type,
       label: t('businessHub.modals.branding.typography'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      id: 'colors',
      icon: Palette,
       label: t('businessHub.modals.branding.colors'),
       valueLabel: t('businessHub.comingSoon'),
      score: null,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-background to-muted dark:from-gray-950 dark:to-gray-900 border-border dark:border-pink-800/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
            <Palette className="h-5 w-5" />
             {t('businessHub.modals.branding.title')}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Overall Branding Score */}
          <Card className="bg-gradient-to-r from-pink-500/10 to-rose-400/10 border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                   {t('businessHub.modals.branding.brandStrength')}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-pink-500" />
                  <span className="text-lg font-bold text-pink-400">--</span>
                </div>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {brandingMetrics.map((metric, index) => (
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
                 {t('businessHub.comingSoonBranding')}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandingModal;
