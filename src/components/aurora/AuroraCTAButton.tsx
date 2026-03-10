import { Compass, Heart, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface AuroraCTAButtonProps {
  type: string;
  onClick?: () => void;
}

const ctaConfig: Record<string, { icon: React.ElementType; hoverBg: string }> = {
  life_direction: { icon: Compass, hoverBg: 'hover:bg-blue-500' },
  explore_values: { icon: Heart, hoverBg: 'hover:bg-rose-500' },
  map_energy: { icon: Zap, hoverBg: 'hover:bg-amber-500' },
  anchor_identity: { icon: User, hoverBg: 'hover:bg-violet-500' },
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
        `hover:bg-${config.colorClass.split(' ')[0].replace('from-', '')}`
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};

export default AuroraCTAButton;
