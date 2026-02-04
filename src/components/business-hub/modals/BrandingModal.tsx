import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Palette, TrendingUp, Image, Type, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const BrandingModal = ({ isOpen, onClose, language }: BrandingModalProps) => {
  const isHebrew = language === 'he';

  const brandingMetrics = [
    {
      id: 'identity',
      icon: Sparkles,
      label: isHebrew ? 'זהות' : 'Identity',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      id: 'visuals',
      icon: Image,
      label: isHebrew ? 'ויזואל' : 'Visuals',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'typography',
      icon: Type,
      label: isHebrew ? 'טיפוגרפיה' : 'Typography',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      id: 'colors',
      icon: Palette,
      label: isHebrew ? 'צבעים' : 'Colors',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
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
          <DialogTitle className="flex items-center gap-2 text-pink-400">
            <Palette className="h-5 w-5" />
            {isHebrew ? 'מיתוג' : 'Branding'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Overall Branding Score */}
          <Card className="bg-gradient-to-r from-pink-500/10 to-rose-400/10 border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {isHebrew ? 'חוזק מותג' : 'Brand Strength'}
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
                {isHebrew 
                  ? 'כלי מיתוג מלאים יהיו זמינים בקרוב. השלם את מסע העסקים שלך כדי להתחיל.'
                  : 'Full branding tools coming soon. Complete your business journey to get started.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandingModal;
