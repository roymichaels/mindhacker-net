import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Lock, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface Episode extends Tables<"content_episodes"> {}

interface Series extends Tables<"content_series"> {
  content_episodes: Episode[];
}

interface CourseCurriculumProps {
  curriculum: Series[];
  hasAccess: boolean;
}

const CourseCurriculum = ({ curriculum, hasAccess }: CourseCurriculumProps) => {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="glass-panel" dir="rtl">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center gap-2">
          <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          תוכנית הלימודים
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Accordion type="multiple" className="space-y-3 sm:space-y-4">
          {curriculum.map((series, seriesIndex) => {
            const sortedEpisodes = series.content_episodes
              ?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];

            return (
              <AccordionItem 
                key={series.id} 
                value={series.id}
                className="border border-border/30 rounded-lg px-3 sm:px-4"
              >
                <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-2 sm:pr-4 gap-2">
                    <div className="text-right flex-1">
                      <div className="font-bold text-sm sm:text-base lg:text-lg mb-1">
                        פרק {seriesIndex + 1}: {series.title}
                      </div>
                      {series.description && (
                        <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                          {series.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs self-start sm:self-auto sm:mr-auto">
                      {sortedEpisodes.length} שיעורים
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {sortedEpisodes.map((episode, episodeIndex) => {
                      const isAccessible = hasAccess || episode.is_preview;

                      return (
                        <div
                          key={episode.id}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 sm:p-3 rounded-lg border border-border/30 ${
                            isAccessible 
                              ? "hover:bg-primary/5 cursor-pointer transition-colors" 
                              : "opacity-60"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {isAccessible ? (
                              <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                            ) : (
                              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                            )}
                            <div className="flex-1 text-right min-w-0">
                              <div className="font-medium flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                <span className="truncate">{episodeIndex + 1}. {episode.title}</span>
                                {episode.is_preview && (
                                  <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                                    תצוגה מקדימה
                                  </Badge>
                                )}
                              </div>
                              {episode.description && (
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {episode.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {episode.duration_seconds && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground self-end sm:self-auto flex-shrink-0">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{formatDuration(episode.duration_seconds)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CourseCurriculum;
