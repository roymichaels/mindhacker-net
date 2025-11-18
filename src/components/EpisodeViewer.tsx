import { VideoPlayer } from "./VideoPlayer";
import { ResourcesDownload } from "./ResourcesDownload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import { useEpisodeProgress } from "@/hooks/useEpisodeProgress";

interface Episode {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  resources_url?: string[];
  transcript_url?: string;
  is_preview?: boolean;
  view_count?: number;
  product_id: string;
}

interface EpisodeViewerProps {
  episode: Episode;
  showResources?: boolean;
}

export const EpisodeViewer = ({ episode, showResources = true }: EpisodeViewerProps) => {
  const { progress, saveProgress, markCompleted } = useEpisodeProgress(
    episode.id,
    episode.product_id
  );

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Episode Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-black cyber-glow">{episode.title}</h1>
          {episode.is_preview && (
            <Badge variant="secondary">תצוגה מקדימה</Badge>
          )}
        </div>
        {episode.description && (
          <p className="text-muted-foreground">{episode.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          {episode.duration_seconds && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(episode.duration_seconds)}
            </div>
          )}
          {episode.view_count !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {episode.view_count} צפיות
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        videoPath={episode.video_url}
        thumbnail={episode.thumbnail_url}
        onTimeUpdate={(currentTime, duration) => {
          saveProgress(currentTime, duration);
        }}
        onEnded={() => {
          markCompleted();
        }}
        className="w-full"
      />

      {/* Progress Indicator */}
      {progress && progress.last_position_seconds && episode.duration_seconds && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">התקדמות</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((progress.last_position_seconds / episode.duration_seconds) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(progress.last_position_seconds / episode.duration_seconds) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {showResources && episode.resources_url && episode.resources_url.length > 0 && (
        <ResourcesDownload resources={episode.resources_url} />
      )}

      {/* Transcript */}
      {showResources && episode.transcript_url && (
        <ResourcesDownload
          resources={[episode.transcript_url]}
          title="תמליל"
          description="תמליל הפרק להורדה"
        />
      )}
    </div>
  );
};
