/**
 * CommunityForumBoard — FXP-style 3-column board index for "All" view.
 * Shows all 14 pillars organized into topic categories.
 */
import { LIFE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { PILLAR_TOPIC_GROUPS, type TopicGroup } from '@/lib/communityHelpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityForumBoardProps {
  onNavigate: (pillarId: string, groupId: string) => void;
}

export default function CommunityForumBoard({ onNavigate }: CommunityForumBoardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  // Fetch all thread counts per pillar+topic
  const { data: allCounts } = useQuery({
    queryKey: ['forum-board-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('pillar, category_id')
        .eq('status', 'approved');
      if (!data) return {};
      const counts: Record<string, number> = {};
      for (const p of data) {
        if (p.pillar && p.category_id) {
          const key = `${p.pillar}::${p.category_id}`;
          counts[key] = (counts[key] || 0) + 1;
        }
        if (p.pillar) {
          counts[p.pillar] = (counts[p.pillar] || 0) + 1;
        }
      }
      return counts;
    },
    staleTime: 60_000,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {LIFE_DOMAINS.map((domain) => (
        <PillarBoard
          key={domain.id}
          domain={domain}
          groups={PILLAR_TOPIC_GROUPS[domain.id] || []}
          counts={allCounts || {}}
          isHe={isHe}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function PillarBoard({
  domain,
  groups,
  counts,
  isHe,
  onNavigate,
}: {
  domain: LifeDomain;
  groups: TopicGroup[];
  counts: Record<string, number>;
  isHe: boolean;
  onNavigate: (pillarId: string, groupId: string) => void;
}) {
  const Icon = domain.icon;
  const totalThreads = counts[domain.id] || 0;
  const colorClass = `text-${domain.color}-500`;
  const bgClass = `bg-${domain.color}-500/8`;
  const borderClass = `border-${domain.color}-500/20`;

  return (
    <div className={cn(
      "rounded-xl border p-3 flex flex-col gap-2",
      borderClass, bgClass
    )}>
      {/* Pillar header */}
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 flex-shrink-0", colorClass)} />
        <h3 className={cn("text-sm font-bold truncate", colorClass)}>
          {isHe ? domain.labelHe : domain.labelEn}
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto flex-shrink-0">
          <MessageSquare className="h-3 w-3" />
          <span>{totalThreads}</span>
        </div>
      </div>

      {/* Category groups only — no subcategories */}
      <div className="flex flex-col gap-1">
        {groups.map((group) => {
          const groupThreads = group.topicIds.reduce(
            (sum, tid) => sum + (counts[`${domain.id}::${tid}`] || 0), 0
          );

          return (
            <button
              key={group.id}
              onClick={() => onNavigate(domain.id, group.id)}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-md text-xs",
                "bg-background/60 hover:bg-primary/10 hover:text-primary",
                "transition-colors text-foreground/80 border border-transparent hover:border-primary/20"
              )}
            >
              <span className="font-medium">{isHe ? group.he : group.en}</span>
              {groupThreads > 0 && (
                <span className="text-[10px] text-muted-foreground">({groupThreads})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
