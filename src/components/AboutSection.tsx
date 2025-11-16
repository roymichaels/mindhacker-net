import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AboutSection = () => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchImage = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "about_image_url")
        .single();
      
      if (data?.setting_value) {
        setImageUrl(data.setting_value);
      }
    };
    fetchImage();
  }, []);

  return (
    <section className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center cyber-border overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Dean Osher Azulay" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
              )}
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 text-center cyber-glow">
            מי עומד מאחורי הקוד?
          </h2>

          <div className="text-center space-y-4 md:space-y-6">
            <p className="text-xl md:text-2xl font-bold text-foreground">
              Dean Osher Azulay
            </p>
            
            <p className="text-base md:text-xl leading-relaxed text-muted-foreground">
              מאמן תודעתי, יוצר שיטות פרקטיות לשינוי תת-מודע, המשלבות היפנוזה מודעת, דמיון מודרך ו־Reframe.
            </p>

            <p className="text-base md:text-lg text-secondary font-medium">
              לא טיפול, אלא חוויית תכנות תודעה.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
