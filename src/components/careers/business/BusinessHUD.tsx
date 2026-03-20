/**
 * BusinessHUD - Character HUD-style component for business dashboard
 * Shows business orb, name, and key metrics
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { BusinessOrb } from '@/components/orb/BusinessOrb';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessHUDProps {
  businessId: string;
  businessName: string;
  industry?: string;
  progress: number;
  isComplete: boolean;
  className?: string;
  onClick?: () => void;
}

export function BusinessHUD({
  businessId,
  businessName,
  industry,
  progress,
  isComplete,
  className,
  onClick,
}: BusinessHUDProps) {
  const { language, isRTL } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-amber-500/20",
        "bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-orange-500/10",
        "backdrop-blur-xl p-4 cursor-pointer transition-all hover:border-amber-500/40",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-400/5 opacity-50" />
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Business Orb */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-yellow-400/30 rounded-full blur-xl" />
          <BusinessOrb
            businessId={businessId}
            size={64}
            state={isComplete ? 'session' : 'idle'}
            showGlow
            className="relative z-10"
          />
        </div>

        {/* Business Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">
            {businessName}
          </h2>
          {industry && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {industry}
            </p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {progress}%
            </span>
          </div>
          
          {isComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600">
                {language === 'he' ? 'פעיל' : 'Active'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-3">
        <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default BusinessHUD;
