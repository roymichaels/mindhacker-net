import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Lock, CheckCircle2, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";

interface Episode extends Tables<"content_episodes"> {}

interface Series extends Tables<"content_series"> {
  content_episodes: Episode[];
}

interface CourseWatchSidebarProps {
  course: Tables<"content_products">;
  curriculum: Series[];
  currentEpisodeId: string;
  onEpisodeSelect: (episodeId: string) => void;
  hasAccess: boolean;
}

const CourseWatchSidebar = ({
  course,
  curriculum,
  currentEpisodeId,
  onEpisodeSelect,
  hasAccess,
}: CourseWatchSidebarProps) => {
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === "collapsed";

  // Track which series contains the current episode
  const currentSeriesId = curriculum.find(series =>
    series.content_episodes?.some(ep => ep.id === currentEpisodeId)
  )?.id;

  const [openSeries, setOpenSeries] = useState<Record<string, boolean>>(
    curriculum.reduce((acc, series) => ({
      ...acc,
      [series.id]: series.id === currentSeriesId,
    }), {})
  );

  // Fetch user progress for all episodes
  const { data: progressData } = useQuery({
    queryKey: ["all-progress", course.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("product_id", course.id)
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getEpisodeProgress = (episodeId: string) => {
    return progressData?.find(p => p.episode_id === episodeId);
  };

  const toggleSeries = (seriesId: string) => {
    setOpenSeries(prev => ({ ...prev, [seriesId]: !prev[seriesId] }));
  };

  if (isCollapsed) {
    return (
      <Sidebar className="w-16 border-l" collapsible="icon">
        <SidebarContent className="flex items-center justify-center pt-4">
          <div className="text-primary">
            <PlayCircle className="h-6 w-6" />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="w-80 border-l" collapsible="icon">
      <SidebarContent>
        {/* Course Header */}
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{course.title}</h3>
              <p className="text-xs text-muted-foreground">
                {curriculum.reduce((acc, s) => acc + (s.content_episodes?.length || 0), 0)} שיעורים
              </p>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="flex-1 overflow-y-auto">
          {curriculum.map((series, seriesIndex) => {
            const sortedEpisodes = series.content_episodes || [];
            const isOpen = openSeries[series.id];

            return (
              <Collapsible
                key={series.id}
                open={isOpen}
                onOpenChange={() => toggleSeries(series.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/20">
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-sm">
                        פרק {seriesIndex + 1}: {series.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sortedEpisodes.length} שיעורים
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenu>
                    {sortedEpisodes.map((episode, episodeIndex) => {
                      const isAccessible = hasAccess || episode.is_preview;
                      const isCurrent = episode.id === currentEpisodeId;
                      const progress = getEpisodeProgress(episode.id);
                      const isCompleted = progress?.completed;

                      return (
                        <SidebarMenuItem key={episode.id}>
                          <SidebarMenuButton
                            onClick={() => isAccessible && onEpisodeSelect(episode.id)}
                            className={cn(
                              "w-full text-right pr-8",
                              isCurrent && "bg-accent text-accent-foreground font-medium",
                              !isAccessible && "opacity-60 cursor-not-allowed"
                            )}
                            disabled={!isAccessible}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                ) : isAccessible ? (
                                  <PlayCircle className="h-4 w-4 text-primary" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm truncate">
                                  {episodeIndex + 1}. {episode.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {episode.duration_seconds && (
                                    <span className="text-xs text-muted-foreground">
                                      {Math.floor(episode.duration_seconds / 60)}:{(episode.duration_seconds % 60).toString().padStart(2, "0")}
                                    </span>
                                  )}
                                  {episode.is_preview && (
                                    <Badge variant="secondary" className="text-xs py-0 px-1">
                                      תצוגה
                                    </Badge>
                                  )}
                                </div>
                                {progress && !isCompleted && progress.last_position_seconds && episode.duration_seconds && (
                                  <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${(progress.last_position_seconds / episode.duration_seconds) * 100}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default CourseWatchSidebar;
