import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2,
  AlertCircle,
  Video,
  Maximize,
  Minimize
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";

interface VideoData {
  title: string;
  description: string | null;
  duration_seconds: number | null;
  video_url: string;
}

const VideoPlayer = () => {
  const { t, isRTL } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useSEO({
    title: videoData?.title || t('audioVideoPlayer.seoVideoTitle'),
    description: videoData?.description || t('audioVideoPlayer.seoVideoDesc'),
  });

  useEffect(() => {
    const fetchVideo = async () => {
      if (!token) {
        setError(t('audioVideoPlayer.invalidLink'));
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-video-by-token', {
          body: { token }
        });

        if (fnError) {
          console.error("Edge function error:", fnError);
          setError(t('audioVideoPlayer.videoLoadError'));
          setLoading(false);
          return;
        }

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setVideoData(data);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(t('audioVideoPlayer.videoLoadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [token, t]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('audioVideoPlayer.loadingVideo')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">{t('audioVideoPlayer.error')}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>{t('audioVideoPlayer.backHome')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="max-w-4xl w-full overflow-hidden" ref={containerRef}>
        {/* Header */}
        <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Video className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold">{videoData?.title}</h1>
          </div>
          {videoData?.description && (
            <p className="text-muted-foreground text-sm">{videoData.description}</p>
          )}
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoData?.video_url || undefined}
              controls
              className="w-full h-full"
              playsInline
            />
            
            {/* Fullscreen button overlay */}
            <Button
              size="icon"
              variant="ghost"
              className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} bg-black/50 hover:bg-black/70 text-white`}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Tip */}
          <p className="text-center text-xs text-muted-foreground">
            {t('audioVideoPlayer.videoTip')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoPlayer;
