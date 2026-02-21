import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityDailyLimit } from '@/hooks/useCommunityDailyLimit';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommunityHeaderProps {
  onCreateThread: () => void;
}

export default function CommunityHeader({ onCreateThread }: CommunityHeaderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { hasPostedToday, loading } = useCommunityDailyLimit();

  return (
    <div className="px-4 pt-6 pb-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t('combatCommunity.communityTitle') || 'MindOS Community'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('combatCommunity.communitySubtitle') || '13 pillars. One civilization.'}
          </p>
        </div>
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  onClick={onCreateThread}
                  disabled={hasPostedToday || loading}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  {t('combatCommunity.newThread')}
                </Button>
              </span>
            </TooltipTrigger>
            {hasPostedToday && (
              <TooltipContent>
                <p>{t('combatCommunity.dailyLimitReached')}</p>
              </TooltipContent>
            )}
          </Tooltip>
        )}
      </div>
    </div>
  );
}
