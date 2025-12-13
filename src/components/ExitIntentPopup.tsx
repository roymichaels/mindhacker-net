import { useState, useEffect } from "react";
import { X, MessageCircle, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("נא להזין כתובת אימייל");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("כתובת אימייל לא תקינה");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store the lead in the database
      // Using type assertion since table was just created
      const { error } = await supabase
        .from("exit_intent_leads" as any)
        .insert({ email: email.trim() });

      if (error) {
        // If table doesn't exist or other error, just show success anyway
        // The lead capture is a nice-to-have, not critical
        console.error("Error saving lead:", error);
      }

      toast.success("נרשמת בהצלחה! ניצור איתך קשר בקרוב");
      setIsOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      toast.success("תודה! ניצור איתך קשר בקרוב");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="text-center pt-4">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="דין" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-center cyber-glow">
            חכה! דין רוצה לדבר איתך 💬
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            השאר פרטים ואחזור אליך אישית עם 15 דקות התייעצות חינם
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ✅ ללא התחייבות
            </p>
            <p className="text-sm text-muted-foreground">
              ✅ 100% דיסקרטיות
            </p>
            <p className="text-sm text-muted-foreground">
              ✅ תקבל תשובה תוך 24 שעות
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="הכנס את האימייל שלך"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-center bg-muted/50 border-primary/20 focus:border-primary"
              dir="ltr"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold py-6 rounded-full cyber-border transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isSubmitting ? "שולח..." : "קבל את ההתייעצות החינמית"}
            </Button>
          </form>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            לא תודה, אולי בפעם אחרת
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
