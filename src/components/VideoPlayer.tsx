import { useEffect, useRef, useState } from "react";
import { useSignedUrl } from "@/hooks/useStorageUrl";
import { Loader2, Play, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoPlayerProps {
  videoPath: string;
  bucket?: string;
  thumbnail?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  autoPlay?: boolean;
  className?: string;
}

export const VideoPlayer = ({
  videoPath,
  bucket = "content-videos",
  thumbnail,
  onTimeUpdate,
  onEnded,
  onProgress,
  autoPlay = false,
  className = "",
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get signed URL for private video or use direct URL
  const isStoragePath = !videoPath.startsWith("http");
  const { url: signedUrl, loading } = useSignedUrl(
    isStoragePath ? bucket : "",
    isStoragePath ? videoPath : null
  );

  const videoUrl = isStoragePath ? signedUrl : videoPath;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      if (onTimeUpdate && !isNaN(duration)) {
        onTimeUpdate(currentTime, duration);
      }

      if (onProgress && !isNaN(duration)) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) {
        onEnded();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError("שגיאה בטעינת הסרטון");
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
    };
  }, [onTimeUpdate, onEnded, onProgress]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg aspect-video ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "לא ניתן לטעון את הסרטון"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        controls
        autoPlay={autoPlay}
        className="w-full h-full"
        preload="metadata"
      >
        הדפדפן שלך לא תומך בתגית וידאו.
      </video>
      
      {!isPlaying && thumbnail && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <Play className="w-16 h-16 text-white opacity-80" />
        </div>
      )}
    </div>
  );
};
