import { useState, useEffect } from "react";
import { Play, Sparkle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import heroPortrait from "@/assets/hero-portrait.png";

const AboutSection = () => {
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const [personalStory, setPersonalStory] = useState("");
  const [aboutVideoUrl, setAboutVideoUrl] = useState("");
  const [aboutVideoEnabled, setAboutVideoEnabled] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  // Use theme portrait or fallback to asset
  const portraitUrl = theme.hero_portrait_url || heroPortrait;

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["personal_story", "about_video_url", "about_video_enabled"]);
      
      if (data) {
        data.forEach(item => {
          if (item.setting_key === "personal_story" && item.setting_value) {
            setPersonalStory(item.setting_value);
          }
          if (item.setting_key === "about_video_url" && item.setting_value) {
            setAboutVideoUrl(item.setting_value);
          }
          if (item.setting_key === "about_video_enabled") {
            setAboutVideoEnabled(item.setting_value === "true");
          }
        });
      }
    };
    fetchSettings();
  }, []);

  const getEmbedUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return url;
  };

  return (
    <section id="about" className="relative py-16 md:py-32 px-4 bg-background" style={{ zIndex: 2 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          {/* Profile Image */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative animate-float-gentle">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center cyber-border overflow-hidden ring-4 ring-primary/20">
                <img 
                  src={portraitUrl} 
                  alt={isRTL ? theme.founder_name : theme.founder_name_en} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-breathe scale-110" />
              
              {/* Sparkle effects */}
              <Sparkle className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-sparkle" />
              <Sparkle className="absolute top-1/4 -left-2 w-2 h-2 text-accent animate-sparkle-delay-1" />
              <Sparkle className="absolute -bottom-1 right-1/4 w-2 h-2 text-primary animate-sparkle-delay-2" />
              <Sparkle className="absolute bottom-1/4 -right-1 w-2 h-2 text-accent animate-sparkle-delay-3" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-4 text-center text-foreground">
            {t('about.sectionTitle')}
          </h2>
          
          <p className="text-center text-secondary text-lg md:text-xl mb-8">
            {t('about.name')}
          </p>

          {/* Personal Story */}
          <div className="text-center space-y-4 md:space-y-6 mb-8">
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              {personalStory || t('about.defaultStory')}
            </p>

            <p className="text-base md:text-lg text-foreground font-medium">
              {t('about.beliefStatement')}
            </p>
          </div>

          {/* Meet Me Video Button */}
          {aboutVideoEnabled && aboutVideoUrl && (
            <div className="text-center">
              <Button
                onClick={() => setIsVideoOpen(true)}
                variant="outline"
                size="lg"
                className="border-primary/50 text-primary hover:bg-primary/10 font-bold px-8 py-6 rounded-full transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5 fill-primary" />
                {t('about.watchVideo')}
              </Button>
            </div>
          )}

          {/* Quote */}
          <div className="mt-8 pt-8 border-t border-primary/20 text-center">
            <p className="text-secondary italic text-base md:text-lg">
              {t('about.quote')}
            </p>
            <p className="text-primary font-bold mt-2">— {isRTL ? theme.founder_short_name : theme.founder_short_name_en}</p>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-primary/30 overflow-hidden">
          <DialogTitle className="sr-only">{t('about.watchVideo')}</DialogTitle>
          <DialogDescription className="sr-only">{t('dialogs.videoDescription')}</DialogDescription>
          <div className="aspect-video w-full">
            <iframe
              src={getEmbedUrl(aboutVideoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AboutSection;
