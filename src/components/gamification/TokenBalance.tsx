import React from 'react';
import { cn } from '@/lib/utils';
import { useTokens } from '@/hooks/useGameState';
import { Coins } from 'lucide-react';

interface TokenBalanceProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TokenBalance({ className, showIcon = true, size = 'md' }: TokenBalanceProps) {
  const { balance } = useTokens();

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

  return (
    <div className={cn(
      'flex items-center font-medium',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <Coins 
          size={iconSizes[size]} 
          className="text-amber-500" 
        />
      )}
      <span className="tabular-nums text-foreground">
        {balance.toLocaleString()}
      </span>
    </div>
  );
}
