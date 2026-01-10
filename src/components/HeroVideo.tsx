import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

const STORAGE_BUCKET = "site-videos";

const HeroVideo = () => {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["hero_video_url", "hero_video_enabled"]);
      
      if (data) {
        data.forEach(item => {
          if (item.setting_key === "hero_video_url" && item.setting_value) {
            setVideoUrl(item.setting_value);
          }
          if (item.setting_key === "hero_video_enabled") {
            setEnabled(item.setting_value === "true");
          }
        });
      }
    };
    fetchSettings();
  }, []);

  // Resolve the video URL (storage file vs external URL)
  useEffect(() => {
    if (!videoUrl) {
      setResolvedUrl("");
      return;
    }

    // Check if it's an external URL (YouTube, Vimeo, or any http(s))
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      setResolvedUrl(videoUrl);
    } else {
      // It's a storage path - get public URL
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(videoUrl);
      setResolvedUrl(data.publicUrl);
    }
  }, [videoUrl]);

  if (!enabled || !resolvedUrl) return null;

  // Check if it's a YouTube/Vimeo URL
  const isExternalEmbed = resolvedUrl.includes("youtube.com") || 
                          resolvedUrl.includes("youtu.be") || 
                          resolvedUrl.includes("vimeo.com");

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return url;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative mt-6 mb-2"
      >
        <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm border border-primary/30 rounded-full px-5 py-3 transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:scale-105">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Play className="w-5 h-5 text-primary fill-primary" />
          </div>
          <span className="text-sm md:text-base text-foreground font-medium">
            {t('heroVideo.watchPersonalMessage')}
          </span>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-primary/30 overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="aspect-video w-full">
            {isExternalEmbed ? (
              <iframe
                src={getEmbedUrl(resolvedUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={resolvedUrl}
                className="w-full h-full"
                controls
                autoPlay
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroVideo;
