import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DecryptText from "./DecryptText";
import SocialProofCounter from "./SocialProofCounter";
import UrgencyBadge from "./UrgencyBadge";
import TrustBadges from "./TrustBadges";
import HeroVideo from "./HeroVideo";
import PersonalQuote from "./PersonalQuote";
import LeadCaptureDialog from "./LeadCaptureDialog";
import { Phone, CreditCard } from "lucide-react";

const HeroSection = () => {
  const words = ["מוח", "תודעה", "חופש", "מציאות", "זהות", "תת־מודע"];
  const [currentWord, setCurrentWord] = useState(0);
  const [showLeadDialog, setShowLeadDialog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const scrollToFreeCall = () => {
    document.getElementById("free-call")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center px-4 md:vignette pt-24 md:pt-32 pb-20 md:pb-24" style={{ zIndex: 2 }}>
      
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
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-16 md:mb-10 leading-tight mt-4 md:mt-8 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 pb-2 animate-fade-in-up">
          <span className="text-foreground static-word-glow w-full md:w-auto text-center">האקר</span>
          <DecryptText 
            text={words[currentWord]} 
            className="text-primary w-full md:w-auto text-center"
          />
        </h1>

        <p className="text-lg sm:text-2xl md:text-3xl text-muted-foreground mb-4 font-medium opacity-0 animate-fade-in-up-delay-1">
          אני מלווה אותך בתהליך עמוק — לא טיפול, לא פסיכולוגיה.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-secondary mb-4 font-light opacity-0 animate-fade-in-up-delay-2">
          תכניס סיסמה. נשום. ברוך הבא אל הקוד שלך.
        </p>

        {/* Personal Video Button */}
        <div className="opacity-0 animate-fade-in-up-delay-3">
          <HeroVideo />
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Personal Quote before CTA */}
        <PersonalQuote 
          settingKey="hero_personal_quote" 
          defaultQuote="אני מחכה לך בצד השני של השינוי"
          className="mt-6 mb-4"
        />

        <div className="mt-4 md:mt-6 flex flex-col items-center gap-3">
          <Button 
            onClick={scrollToFreeCall}
            size="lg"
            className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg md:text-xl px-8 py-4 md:px-12 md:py-6 rounded-full cyber-border pulse-glow transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto animate-attention-pulse"
          >
            <Phone className="w-5 h-5 md:w-6 md:h-6" />
            קבע שיחת היכרות חינם
          </Button>
          
          {/* Secondary CTA - Pricing */}
          <button
            onClick={scrollToPricing}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            או ראה את החבילות שלי
          </button>
          
          {/* Urgency Badge */}
          <div className="mt-2">
            <UrgencyBadge />
          </div>
        </div>

        <LeadCaptureDialog 
          open={showLeadDialog} 
          onOpenChange={setShowLeadDialog}
          source="hero"
        />

        {/* Social Proof Counter */}
        <SocialProofCounter />
      </div>
    </section>
  );
};

export default HeroSection;
