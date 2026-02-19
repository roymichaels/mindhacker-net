import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoPath: string;
  thumbnail?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
}

export const VideoPlayer = ({
  videoPath,
  thumbnail,
  onTimeUpdate,
  onEnded,
  className,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate && video.duration) {
        onTimeUpdate(video.currentTime, video.duration);
      }
    };

    const handleEnded = () => {
      onEnded?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  return (
    <video
      ref={videoRef}
      src={videoPath}
      poster={thumbnail}
      controls
      className={cn("rounded-lg", className)}
    />
  );
};

export default VideoPlayer;
