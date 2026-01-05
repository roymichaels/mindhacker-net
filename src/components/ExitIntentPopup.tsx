import { useState, useEffect } from "react";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import LeadCaptureForm from "./LeadCaptureForm";
import { useTranslation } from "@/hooks/useTranslation";

const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    // Fetch about image for personal touch
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

    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem("exitIntentShown");
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top of the page
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Add a small delay before enabling the exit intent
    const timeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-background/95 backdrop-blur-xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="text-center pt-4">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={t('exitPopup.imageAlt')} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <User className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-center cyber-glow">
            {t('exitPopup.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            {t('exitPopup.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('exitPopup.benefit1')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('exitPopup.benefit2')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('exitPopup.benefit3')}
            </p>
          </div>

          <LeadCaptureForm 
            source="exit_popup" 
            variant="compact"
            onSuccess={handleSuccess}
          />

          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('exitPopup.dismiss')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;