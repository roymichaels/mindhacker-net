import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface EgoStateDisplayProps {
  id: string;
  name: string;
  nameHe: string;
  icon: string;
  gradient: string;
  className?: string;
}

export function EgoStateDisplay({ 
  id, 
  name, 
  nameHe, 
  icon, 
  gradient,
  className 
}: EgoStateDisplayProps) {
  const { t, isRTL, language } = useTranslation();

  const displayName = language === 'he' ? nameHe : name;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-br",
        gradient,
        "bg-opacity-10",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur flex items-center justify-center text-2xl shadow-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {t('unified.egoState.active')}
        </p>
      </div>
    </div>
  );
}
