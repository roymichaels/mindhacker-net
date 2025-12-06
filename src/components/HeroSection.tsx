import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DecryptText from "./DecryptText";
import SocialProofCounter from "./SocialProofCounter";
import UrgencyBadge from "./UrgencyBadge";
import TrustBadges from "./TrustBadges";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  const words = ["מוח", "תודעה", "חופש", "מציאות", "זהות", "תת־מודע"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const scrollToBooking = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center px-4 vignette pt-24 md:pt-32 pb-20 md:pb-24" style={{ zIndex: 2 }}>
      
      {/* Radial glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 240, 255, 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Consciousness pulse behind headline - single pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[600px] md:h-[900px] border border-primary/30 rounded-full consciousness-pulse pointer-events-none" />

      {/* Sacred geometry background - simplified */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 border border-primary rounded-full animate-breathe" />
      </div>

      <div className="relative text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 leading-tight mt-4 md:mt-8">
          <span className="text-foreground static-word-glow">האקר </span>
          <DecryptText 
            text={words[currentWord]} 
            className="text-primary"
          />
        </h1>

        <p className="text-lg sm:text-2xl md:text-3xl text-muted-foreground mb-4 font-medium">
          אימון תודעתי עמוק — לא טיפול, לא פסיכולוגיה.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-secondary mb-6 md:mb-8 font-light">
          תכניס סיסמה. נשום. ברוך הבא אל הקוד שלך.
        </p>

        {/* Trust Badges */}
        <TrustBadges />

        <div className="mt-8 md:mt-10">
          <Button 
            onClick={scrollToBooking}
            size="lg"
            className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg md:text-xl px-8 py-4 md:px-12 md:py-6 rounded-full cyber-border pulse-glow transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            התחל את השינוי עכשיו
          </Button>
          
          {/* Urgency Badge */}
          <div className="mt-4">
            <UrgencyBadge spotsLeft={3} />
          </div>
        </div>

        {/* Social Proof Counter */}
        <SocialProofCounter />

        {/* Vertical energy lines */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-px h-40 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
