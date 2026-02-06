import { MessageCircle, Brain, Users, CheckSquare, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionsBarProps {
  onOpenChat?: () => void;
  onOpenHypnosis?: () => void;
}

export function QuickActionsBar({ onOpenChat, onOpenHypnosis }: QuickActionsBarProps) {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      id: 'aurora',
      icon: MessageCircle,
      label: language === 'he' ? 'אורורה' : 'Aurora',
      color: 'text-primary hover:text-primary',
      bgColor: 'hover:bg-primary/10',
      onClick: onOpenChat || (() => navigate('/aurora')),
    },
    {
      id: 'hypnosis',
      icon: Brain,
      label: language === 'he' ? 'היפנוזה' : 'Hypnosis',
      color: 'text-purple-500 hover:text-purple-500',
      bgColor: 'hover:bg-purple-500/10',
      onClick: onOpenHypnosis,
    },
    {
      id: 'practitioners',
      icon: Users,
      label: language === 'he' ? 'מאמנים' : 'Coaches',
      color: 'text-amber-500 hover:text-amber-500',
      bgColor: 'hover:bg-amber-500/10',
      onClick: () => navigate('/practitioners'),
    },
    {
      id: 'missions',
      icon: CheckSquare,
      label: language === 'he' ? 'משימות' : 'Missions',
      color: 'text-emerald-500 hover:text-emerald-500',
      bgColor: 'hover:bg-emerald-500/10',
      onClick: () => navigate('/missions'),
    },
    {
      id: 'insights',
      icon: BarChart3,
      label: language === 'he' ? 'תובנות' : 'Insights',
      color: 'text-amber-500 hover:text-amber-500',
      bgColor: 'hover:bg-amber-500/10',
      onClick: () => navigate('/consciousness'),
    },
  ];

  return (
    <div 
      className="grid grid-cols-5 gap-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="ghost"
            className={cn(
              "h-auto py-3 flex-col gap-1.5",
              "border border-border/50 rounded-xl",
              "transition-all duration-200",
              action.bgColor
            )}
            onClick={action.onClick}
          >
            <Icon className={cn("h-5 w-5", action.color)} />
            <span className="text-xs font-medium text-muted-foreground">
              {action.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
