import { 
  MessageSquare, 
  Brain, 
  CheckSquare, 
  Target, 
  Rocket,
  MoreHorizontal,
  FileDown,
  Settings,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useProfilePDF } from '@/hooks/useProfilePDF';
import { ProfilePDFRenderer } from '@/components/pdf/ProfilePDFRenderer';
import { cn } from '@/lib/utils';

interface CommandCenterGridProps {
  pendingTasksCount?: number;
  onOpenChat?: () => void;
  onOpenHypnosis?: () => void;
  onOpenTasks?: () => void;
}

interface ActionCard {
  id: string;
  icon: React.ElementType;
  label: string;
  labelHe: string;
  description: string;
  descriptionHe: string;
  gradient: string;
  iconColor: string;
  onClick: () => void;
  badge?: string | number;
  isLoading?: boolean;
}

export function CommandCenterGrid({
  pendingTasksCount = 0,
  onOpenChat,
  onOpenHypnosis,
  onOpenTasks,
}: CommandCenterGridProps) {
  const { language, isRTL, t } = useTranslation();
  const navigate = useNavigate();
  const { downloadPDF, generating, containerRef, pdfData, showRenderer } = useProfilePDF();
  const isHebrew = language === 'he';

  const primaryActions: ActionCard[] = [
    {
      id: 'aurora',
      icon: MessageSquare,
      label: 'Aurora',
      labelHe: 'אורורה',
      description: 'Chat with AI coach',
      descriptionHe: 'שוחח עם המאמנת',
      gradient: 'from-purple-500/15 to-pink-500/10',
      iconColor: 'text-purple-500',
      onClick: () => { onOpenChat?.(); if (!onOpenChat) navigate('/aurora'); },
    },
    {
      id: 'hypnosis',
      icon: Brain,
      label: 'Hypnosis',
      labelHe: 'היפנוזה',
      description: 'Start session',
      descriptionHe: 'התחל סשן',
      gradient: 'from-indigo-500/15 to-purple-500/10',
      iconColor: 'text-indigo-500',
      onClick: () => onOpenHypnosis?.(),
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      label: 'Missions',
      labelHe: 'משימות',
      description: 'View roadmap',
      descriptionHe: 'צפה במפה',
      gradient: 'from-green-500/15 to-emerald-500/10',
      iconColor: 'text-green-500',
      onClick: () => onOpenTasks?.(),
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
  ];

  const secondaryActions: ActionCard[] = [
    {
      id: '90-day',
      icon: Target,
      label: '90-Day Plan',
      labelHe: 'תוכנית 90 יום',
      description: 'Track progress',
      descriptionHe: 'עקוב אחר ההתקדמות',
      gradient: 'from-blue-500/15 to-cyan-500/10',
      iconColor: 'text-blue-500',
      onClick: () => navigate('/life-plan'),
    },
    {
      id: 'launchpad',
      icon: Rocket,
      label: 'Launchpad',
      labelHe: 'לאנצ\'פד',
      description: 'Edit journey',
      descriptionHe: 'ערוך את המסע',
      gradient: 'from-amber-500/15 to-orange-500/10',
      iconColor: 'text-amber-500',
      onClick: () => navigate('/launchpad'),
    },
  ];

  const renderCard = (action: ActionCard) => {
    const Icon = action.icon;
    
    return (
      <Card
        key={action.id}
        onClick={action.isLoading ? undefined : action.onClick}
        className={cn(
          "relative p-4 cursor-pointer transition-all duration-200",
          "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
          "flex flex-col items-center justify-center gap-2 text-center min-h-[100px]",
          `bg-gradient-to-br ${action.gradient}`,
          action.isLoading && "opacity-70 cursor-wait"
        )}
      >
        {/* Badge */}
        {action.badge && (
          <span className="absolute top-2 end-2 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {action.badge}
          </span>
        )}
        
        <div className={cn(
          "p-2 rounded-xl bg-background/60 backdrop-blur-sm",
          action.isLoading && "animate-pulse"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            action.iconColor,
            action.isLoading && "animate-spin"
          )} />
        </div>
        
        <div>
          <p className="font-medium text-sm">
            {isHebrew ? action.labelHe : action.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {isHebrew ? action.descriptionHe : action.description}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Primary Actions - Top Row */}
      <div className="grid grid-cols-3 gap-3">
        {primaryActions.map(renderCard)}
      </div>

      {/* Secondary Actions - Bottom Row */}
      <div className="grid grid-cols-3 gap-3">
        {secondaryActions.map(renderCard)}
        
        {/* More Tools Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                "flex flex-col items-center justify-center gap-2 text-center min-h-[100px]",
                "bg-gradient-to-br from-muted/50 to-muted/30"
              )}
            >
              <div className="p-2 rounded-xl bg-background/60 backdrop-blur-sm">
                <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isHebrew ? 'עוד כלים' : 'More Tools'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isHebrew ? 'אפשרויות נוספות' : 'More options'}
                </p>
              </div>
            </Card>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
            <DropdownMenuItem 
              onClick={downloadPDF}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {isHebrew ? 'הורד PDF' : 'Download PDF'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              {isHebrew ? 'הגדרות' : 'Settings'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hidden PDF Renderer */}
      {showRenderer && pdfData && (
        <ProfilePDFRenderer ref={containerRef} data={pdfData} />
      )}
    </div>
  );
}
