import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approximately 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBooking = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-4 bg-gradient-to-t from-background via-background/95 to-transparent"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
    >
      <Button
        onClick={scrollToBooking}
        size="lg"
        className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg py-6 rounded-full cyber-border pulse-glow flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        קבע סשן עכשיו
      </Button>
    </div>
  );
};

export default FloatingCTA;
