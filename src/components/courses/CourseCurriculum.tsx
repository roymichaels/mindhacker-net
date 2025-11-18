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
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-primary" />
          תוכנית הלימודים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-4">
          {curriculum.map((series, seriesIndex) => {
            const sortedEpisodes = series.content_episodes
              ?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];

            return (
              <AccordionItem 
                key={series.id} 
                value={series.id}
                className="border border-border/30 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-right">
                      <div className="font-bold text-lg mb-1">
                        פרק {seriesIndex + 1}: {series.title}
                      </div>
                      {series.description && (
                        <div className="text-sm text-muted-foreground">
                          {series.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="mr-auto">
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
                          className={`flex items-center justify-between p-3 rounded-lg border border-border/30 ${
                            isAccessible 
                              ? "hover:bg-primary/5 cursor-pointer transition-colors" 
                              : "opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {isAccessible ? (
                              <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 text-right">
                              <div className="font-medium flex items-center gap-2">
                                <span>{episodeIndex + 1}. {episode.title}</span>
                                {episode.is_preview && (
                                  <Badge variant="secondary" className="text-xs">
                                    תצוגה מקדימה
                                  </Badge>
                                )}
                              </div>
                              {episode.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {episode.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {episode.duration_seconds && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
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
