import { Compass, Heart, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface AuroraCTAButtonProps {
  type: string;
  onClick?: () => void;
}

const ctaConfig: Record<string, { icon: React.ElementType; colorClass: string }> = {
  life_direction: { icon: Compass, colorClass: 'from-blue-500 to-cyan-500' },
  explore_values: { icon: Heart, colorClass: 'from-rose-500 to-pink-500' },
  map_energy: { icon: Zap, colorClass: 'from-amber-500 to-orange-500' },
  anchor_identity: { icon: User, colorClass: 'from-violet-500 to-purple-500' },
};

const AuroraCTAButton = ({ type, onClick }: AuroraCTAButtonProps) => {
  const { t } = useTranslation();
  
  const config = ctaConfig[type];
  if (!config) return null;

  const Icon = config.icon;
  const label = t(`aurora.cta.${type}`);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 rounded-full border-2",
        "hover:border-transparent hover:text-white",
        `hover:bg-gradient-to-r ${config.colorClass}`
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};

export default AuroraCTAButton;
