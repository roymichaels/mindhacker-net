/**
 * CommunityLayoutWrapper - Desktop sidebar + mobile inline layout for Community hub.
 * On lg+ screens, pillars are shown in a persistent left sidebar.
 * On smaller screens, pillars remain as inline cards.
 */
import { Suspense, lazy, useState } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { PILLAR_SUBCATEGORIES } from '@/lib/communityHelpers';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Community = lazy(() => import('@/pages/Community'));

export default function CommunityLayoutWrapper() {
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { language } = useTranslation();
  const isHe = language === 'he';

  const handlePillarSelect = (pillar: string) => {
    setSelectedPillar(pillar);
    setSelectedTopic(null);
  };

  // Suppress all sidebars — pillars/topics are inline cards or desktop sidebar
  useSidebars(null, null, []);

  // Fetch pillar thread counts for sidebar badges
  const { data: pillarCounts } = useQuery({
    queryKey: ['community-pillar-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('pillar')
        .eq('status', 'approved');
      if (!data) return {};
      const counts: Record<string, number> = {};
      for (const p of data) {
        if (p.pillar) counts[p.pillar] = (counts[p.pillar] || 0) + 1;
      }
      return counts;
    },
    staleTime: 60_000,
  });

  // Subcategories for selected pillar
  const subcategories = PILLAR_SUBCATEGORIES[selectedPillar] || [];

  return (
    <div className="flex w-full min-h-0">
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 border-border/40 overflow-y-auto",
          "bg-card/30 backdrop-blur-sm py-3 px-2 gap-0.5",
          isHe ? "border-l" : "border-r"
        )}
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        {/* All pillars button */}
        <button
          onClick={() => handlePillarSelect('all')}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full",
            selectedPillar === 'all'
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <span className="text-base">🌐</span>
          <span>{isHe ? 'כל הנושאים' : 'All Topics'}</span>
        </button>

        <div className="h-px bg-border/30 my-1.5" />

        {/* Pillar list */}
        {LIFE_DOMAINS.map((d) => {
          const Icon = d.icon;
          const isActive = selectedPillar === d.id;
          const count = pillarCounts?.[d.id] || 0;
          return (
            <button
              key={d.id}
              onClick={() => handlePillarSelect(d.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all w-full group",
                isActive
                  ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="truncate flex-1 text-start">{isHe ? d.labelHe : d.labelEn}</span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] tabular-nums flex-shrink-0",
                  isActive ? "text-primary/70" : "text-muted-foreground/60"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Subcategories when pillar selected */}
        {selectedPillar !== 'all' && subcategories.length > 0 && (
          <>
            <div className="h-px bg-border/30 my-1.5" />
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {isHe ? 'נושאים' : 'Topics'}
            </p>
            <button
              onClick={() => setSelectedTopic(null)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all w-full",
                !selectedTopic
                  ? "bg-accent/20 text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <span>🌐</span>
              <span>{isHe ? 'הכל' : 'All'}</span>
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedTopic(sub.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all w-full",
                  selectedTopic === sub.id
                    ? "bg-accent/20 text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <span>{sub.icon}</span>
                <span className="truncate">{isHe ? sub.he : sub.en}</span>
              </button>
            ))}
          </>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={null}>
          <Community
            selectedPillar={selectedPillar}
            onPillarSelect={handlePillarSelect}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            createOpen={createOpen}
            onCreateOpenChange={setCreateOpen}
          />
        </Suspense>
      </div>
    </div>
  );
}
