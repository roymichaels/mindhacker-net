import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, PiggyBank, BarChart3, X } from "lucide-react";
import { motion } from "framer-motion";

interface FinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const FinancialsModal = ({ isOpen, onClose, language }: FinancialsModalProps) => {
  const isHebrew = language === 'he';

  const financialMetrics = [
    {
      id: 'revenue',
      icon: DollarSign,
      label: isHebrew ? 'הכנסות' : 'Revenue',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'expenses',
      icon: BarChart3,
      label: isHebrew ? 'הוצאות' : 'Expenses',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      id: 'profit',
      icon: TrendingUp,
      label: isHebrew ? 'רווח' : 'Profit',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'savings',
      icon: PiggyBank,
      label: isHebrew ? 'חיסכון' : 'Savings',
      valueLabel: isHebrew ? 'בקרוב' : 'Coming soon',
      score: null,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
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
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <DollarSign className="h-5 w-5" />
            {isHebrew ? 'פיננסים' : 'Financials'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Overall Financial Score */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {isHebrew ? 'בריאות פיננסית' : 'Financial Health'}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="text-lg font-bold text-amber-400">--</span>
                </div>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {financialMetrics.map((metric, index) => (
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
                  ? 'מעקב פיננסי מלא יהיה זמין בקרוב. השלם את מסע העסקים שלך כדי להתחיל.'
                  : 'Full financial tracking coming soon. Complete your business journey to get started.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialsModal;
