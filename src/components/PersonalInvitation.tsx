import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, MessageCircle } from "lucide-react";
import LeadCaptureDialog from "./LeadCaptureDialog";

const PersonalInvitation = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [message, setMessage] = useState("אם הגעת עד לכאן, סימן שמשהו בפנים שלך מזמין אותך לשינוי. אני מחכה לשיחה הראשונה שלנו.");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["about_image_url", "personal_invitation_message"]);
      
      if (data) {
        data.forEach(item => {
          if (item.setting_key === "about_image_url" && item.setting_value) {
            setImageUrl(item.setting_value);
          }
          if (item.setting_key === "personal_invitation_message" && item.setting_value) {
            setMessage(item.setting_value);
          }
        });
      }
    };
    fetchSettings();
  }, []);

  const scrollToFreeCall = () => {
    document.getElementById("free-call")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-16 md:py-24 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Personal photo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center cyber-border overflow-hidden ring-4 ring-primary/20">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="דין אושר אזולאי" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
                )}
              </div>
            </div>

            {/* Personal message */}
            <p className="text-xl md:text-2xl text-foreground mb-2 font-medium">
              הודעה אישית מדין
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
              "{message}"
            </p>

            {/* Signature */}
            <p className="text-primary font-bold text-lg mb-8">
              — דין אושר אזולאי
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LeadCaptureDialog 
                source="invitation"
                triggerText="השאר פרטים ונדבר"
                triggerIcon={<Phone className="w-5 h-5" />}
                triggerClassName="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg px-8 py-6 rounded-full cyber-border pulse-glow transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                showPreferredTime
              />
              
              <Button 
                onClick={scrollToFreeCall}
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 font-bold text-lg px-8 py-6 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                שיחת היכרות חינם
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalInvitation;
