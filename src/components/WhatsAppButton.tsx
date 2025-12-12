import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["whatsapp_number", "whatsapp_enabled"]);

      if (!error && data) {
        const settings = data.reduce((acc: Record<string, string>, item) => {
          acc[item.setting_key] = item.setting_value || "";
          return acc;
        }, {});
        
        setWhatsappNumber(settings.whatsapp_number || "");
        setIsEnabled(settings.whatsapp_enabled === "true");
      }
    };

    fetchSettings();
  }, []);

  if (!isEnabled || !whatsappNumber) return null;

  const message = encodeURIComponent("היי, אני מעוניין לשמוע עוד על אימון תודעתי 🙏");
  const cleanedNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group animate-bounce-slow"
      style={{ animationDuration: "3s" }}
      aria-label="צור קשר בוואטסאפ"
    >
      <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
      
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </a>
  );
};

export default WhatsAppButton;
