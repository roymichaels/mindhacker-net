import React from 'react';
import { cn } from '@/lib/utils';
import { useEnergy } from '@/hooks/useGameState';
import { Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnergyBalanceProps {
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function EnergyBalance({ className, showIcon = true, showTooltip = true, size = 'md' }: EnergyBalanceProps) {
  const { balance } = useEnergy();

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const content = (
    <div className={cn(
      'flex items-center font-medium',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <Zap 
          size={iconSizes[size]} 
          className="text-yellow-500 fill-yellow-500/30" 
        />
      )}
      <span className="tabular-nums text-foreground">
        {balance.toLocaleString()}
      </span>
    </div>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] text-center">
          <p className="text-xs">Energy is used for Hypnosis sessions, Re-evaluations, and premium Aurora messages</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
