import { useState, useEffect } from "react";
import { User, Play, Award, Heart, Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const AboutSection = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [personalStory, setPersonalStory] = useState("");
  const [aboutVideoUrl, setAboutVideoUrl] = useState("");
  const [aboutVideoEnabled, setAboutVideoEnabled] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["about_image_url", "personal_story", "about_video_url", "about_video_enabled"]);
      
      if (data) {
        data.forEach(item => {
          if (item.setting_key === "about_image_url" && item.setting_value) {
            setImageUrl(item.setting_value);
          }
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

  const milestones = [
    { icon: Brain, text: "10+ שנות ניסיון בתודעה" },
    { icon: Heart, text: "200+ לקוחות מרוצים" },
    { icon: Award, text: "מוסמך NLP & היפנוזה" },
  ];

  return (
    <section className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          {/* Profile Image */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center cyber-border overflow-hidden ring-4 ring-primary/20">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Dean Osher Azulay" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 md:w-18 md:h-18 text-primary-foreground" />
                )}
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-breathe scale-110" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-4 text-center cyber-glow">
            הכירו אותי
          </h2>
          
          <p className="text-center text-secondary text-lg md:text-xl mb-8">
            Dean Osher Azulay
          </p>

          {/* Personal Story */}
          <div className="text-center space-y-4 md:space-y-6 mb-8">
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              {personalStory || "התחלתי את הדרך שלי אחרי שעברתי בעצמי תקופה של מאבק פנימי. גיליתי שהכלים הקונבנציונליים לא עבדו בשבילי — אז יצאתי לחפש משהו אחר. היום אני משלב היפנוזה מודעת, דמיון מודרך ו-Reframe כדי לעזור לאחרים לשחרר את מה שעוצר אותם."}
            </p>

            <p className="text-base md:text-lg text-foreground font-medium">
              אני מאמין שכל אחד יכול לשנות את הקוד הפנימי שלו — וזה בדיוק מה שאני עושה יחד איתך.
            </p>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className="flex items-center justify-center gap-3 bg-primary/5 rounded-lg px-4 py-3 border border-primary/20"
              >
                <milestone.icon className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">{milestone.text}</span>
              </div>
            ))}
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
                צפה בסרטון הכרות
              </Button>
            </div>
          )}

          {/* Quote */}
          <div className="mt-8 pt-8 border-t border-primary/20 text-center">
            <p className="text-secondary italic text-base md:text-lg">
              "לא טיפול, אלא חוויית תכנות תודעה."
            </p>
            <p className="text-primary font-bold mt-2">— Dean</p>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-primary/30 overflow-hidden">
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
