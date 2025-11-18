import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface CourseWatchHeaderProps {
  course: Tables<"content_products">;
  currentEpisode: Tables<"content_episodes"> | null;
  nextEpisode: Tables<"content_episodes"> | null;
  prevEpisode: Tables<"content_episodes"> | null;
  onNavigate: (episodeId: string) => void;
}

const CourseWatchHeader = ({
  course,
  currentEpisode,
  nextEpisode,
  prevEpisode,
  onNavigate,
}: CourseWatchHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="mr-2" />

        {/* Back to Course */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/courses/${course.slug}`)}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">חזור לקורס</span>
        </Button>

        {/* Course Title & Current Episode */}
        <div className="flex-1 min-w-0 mr-4">
          <div className="font-bold truncate">{course.title}</div>
          {currentEpisode && (
            <div className="text-sm text-muted-foreground truncate">
              {currentEpisode.title}
            </div>
          )}
        </div>

        {/* Episode Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => prevEpisode && onNavigate(prevEpisode.id)}
            disabled={!prevEpisode}
            className="gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            קודם
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => nextEpisode && onNavigate(nextEpisode.id)}
            disabled={!nextEpisode}
            className="gap-1"
          >
            הבא
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CourseWatchHeader;
