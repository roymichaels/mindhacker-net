import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Clock, CheckCircle, Heart, Calendar, ArrowLeft } from "lucide-react";
import LeadCaptureDialog from "./LeadCaptureDialog";

const FreeDiscoveryCall = () => {
  const [calendlyLink, setCalendlyLink] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["free_call_calendly_link", "free_call_enabled"]);
      
      if (data) {
        data.forEach(item => {
          if (item.setting_key === "free_call_calendly_link" && item.setting_value) {
            setCalendlyLink(item.setting_value);
          }
          if (item.setting_key === "free_call_enabled") {
            setEnabled(item.setting_value === "true");
          }
        });
      }
    };
    fetchSettings();
  }, []);

  if (!enabled) return null;

  return (
    <section id="free-call" className="relative py-12 md:py-20 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-10 border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              ללא עלות, ללא התחייבות
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black mb-3 cyber-glow">
              לא בטוח? בוא נכיר קודם 🤝
            </h3>
            
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
              15 דקות שיחת היכרות איתי באופן אישי — נדבר על מה שמטריד אותך ונבדוק אם אני יכול לעזור.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Clock className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">15 דקות בלבד</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Phone className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">שיחת וידאו או טלפון</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">100% דיסקרטיות</span>
            </div>
          </div>

          {/* Two CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <LeadCaptureDialog 
              source="discovery"
              triggerText="השאר פרטים ואחזור אליך"
              triggerVariant="default"
              triggerClassName="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              triggerIcon={<Phone className="w-5 h-5" />}
              showPreferredTime
            />
            
            {calendlyLink && (
              <Button 
                onClick={() => window.open(calendlyLink, "_blank")}
                variant="outline"
                size="lg"
                className="border-secondary/50 text-secondary hover:bg-secondary/10 font-bold text-lg px-8 py-6 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                או קבע בעצמך
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            * אני עונה לכל בקשה תוך 24 שעות
          </p>
        </div>
      </div>
    </section>
  );
};

export default FreeDiscoveryCall;
