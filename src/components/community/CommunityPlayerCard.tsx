/**
 * CommunityPlayerCard - Compact card showing user's community identity.
 * Shows: Orb (personalized), Username, Global Level, Pillar Rank, Reputation Tier.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useUserReputation } from '@/hooks/useCommunityFeed';
import { useCommunityUsername } from '@/hooks/useCommunityUsername';
import { calculateReputation, getReputationTier, getPillarRank } from '@/lib/communityHelpers';
import { useXpProgress } from '@/hooks/useGameState';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, Heart, TrendingUp } from 'lucide-react';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { cn } from '@/lib/utils';

interface CommunityPlayerCardProps {
  userId: string;
}

export default function CommunityPlayerCard({ userId }: CommunityPlayerCardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { username } = useCommunityUsername();
  const { data: rep } = useUserReputation(userId);
  const xp = useXpProgress();

  const reputation = rep
    ? calculateReputation(rep.approvedThreads, rep.replies, rep.likesReceived)
    : 0;
  const tier = getReputationTier(reputation);
  const rank = getPillarRank(xp.level);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3">
      <div className="flex items-center gap-3">
        {/* Current user's own orb */}
        <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 48, height: 48 }}>
          <PersonalizedOrb size={48} state="idle" showGlow={false} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm truncate">
              {username ? `@${username}` : '—'}
            </span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary/40 text-primary">
              {isHe ? rank.he : rank.en}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-500" /> Lv.{xp.level}
            </span>
            <span className={cn("flex items-center gap-0.5 font-medium", tier.color)}>
              <TrendingUp className="h-3 w-3" /> {isHe ? tier.he : tier.en}
            </span>
            {rep && (
              <>
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="h-3 w-3" /> {rep.postsCount + rep.commentsCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="h-3 w-3" /> {rep.likesReceived}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
