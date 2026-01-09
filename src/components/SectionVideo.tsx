import { useState, useEffect, useRef, useCallback } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SectionVideoProps {
  settingKeyUrl: string;
  settingKeyEnabled: string;
  title?: string;
  thumbnailUrl?: string;
  className?: string;
  buttonText?: string;
  sectionName: string; // For analytics tracking
}

export const SectionVideo = ({
  settingKeyUrl,
  settingKeyEnabled,
  title = "Watch Video",
  thumbnailUrl,
  className = "",
  buttonText,
  sectionName,
}: SectionVideoProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);
  const videoStartTime = useRef<number | null>(null);

  useEffect(() => {
    const fetchVideoSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [settingKeyUrl, settingKeyEnabled]);

      if (data) {
        const settings = Object.fromEntries(
          data.map((s) => [s.setting_key, s.setting_value])
        );
        setVideoUrl(settings[settingKeyUrl] || null);
        setIsEnabled(settings[settingKeyEnabled] === "true");
      }
    };

    fetchVideoSettings();
  }, [settingKeyUrl, settingKeyEnabled]);

  const getEmbedUrl = (url: string): string => {
    // Convert YouTube URLs to embed format
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    // Vimeo
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    videoStartTime.current = Date.now();
    
    if (!hasTrackedPlay) {
      trackEvent("video_play", "engagement", sectionName, {
        videoUrl,
        sectionName,
      });
      setHasTrackedPlay(true);
    }
  }, [hasTrackedPlay, sectionName, videoUrl]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    
    if (videoStartTime.current) {
      const watchTime = Math.round((Date.now() - videoStartTime.current) / 1000);
      trackEvent("video_close", "engagement", sectionName, {
        watchTimeSeconds: watchTime,
        sectionName,
      });
      videoStartTime.current = null;
    }
  }, [sectionName]);

  if (!isEnabled || !videoUrl) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className={`gap-2 group ${className}`}
      >
        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
        {buttonText || title}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black/95 border-primary/20">
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Close video"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative aspect-video w-full">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SectionVideo;
