/**
 * CommunityForumBoard — Mobile-app-style stacked pillar cards for "All" view.
 * Big, bold cards with pillar icon, name, thread count, and category list.
 */
import { LIFE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { PILLAR_TOPIC_GROUPS, type TopicGroup } from '@/lib/communityHelpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityForumBoardProps {
  onNavigate: (pillarId: string, groupId: string) => void;
}

export default function CommunityForumBoard({ onNavigate }: CommunityForumBoardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

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
    <div className="flex flex-col gap-3">
      {LIFE_DOMAINS.map((domain) => (
        <PillarCard
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

function PillarCard({
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

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
      {/* Pillar header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/30">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          "bg-primary/10"
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">
            {isHe ? domain.labelHe : domain.labelEn}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{totalThreads}</span>
        </div>
      </div>

      {/* Category rows */}
      <div className="divide-y divide-border/20">
        {groups.map((group) => {
          const groupThreads = group.topicIds.reduce(
            (sum, tid) => sum + (counts[`${domain.id}::${tid}`] || 0), 0
          );

          return (
            <button
              key={group.id}
              onClick={() => onNavigate(domain.id, group.id)}
              className={cn(
                "flex items-center w-full px-4 py-3 text-start",
                "hover:bg-accent/10 active:bg-accent/20 transition-colors"
              )}
            >
              <span className="flex-1 text-sm text-foreground/90 font-medium">
                {isHe ? group.he : group.en}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {groupThreads > 0 && (
                  <span className="text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                    {groupThreads}
                  </span>
                )}
                <ChevronRight className={cn("h-4 w-4 text-muted-foreground/50", isHe && "rotate-180")} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
