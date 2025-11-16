import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Brain3DModel from "./Brain3DModel";
import DecryptText from "./DecryptText";

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
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden vignette py-16 md:py-0" style={{ zIndex: 2 }}>
      
      {/* Radial glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 240, 255, 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Consciousness pulse behind headline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] border border-primary rounded-full consciousness-pulse pointer-events-none" />

      {/* Sacred geometry background - more subtle */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 border border-primary rounded-full animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-24 md:w-48 h-24 md:h-48 border border-primary-glow rotate-45 animate-breathe" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/3 right-1/3 w-16 md:w-32 h-16 md:h-32 border border-secondary animate-breathe" style={{ animationDelay: "6s" }} />
      </div>

      <div className="relative text-center max-w-4xl mx-auto">
        {/* 3D Brain Model above title */}
        <div className="flex justify-center mb-2 md:mb-3 mt-16 md:mt-20">
          <Brain3DModel className="h-72 w-72 md:h-96 md:w-96" style={{ zIndex: 100 }} />
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 leading-tight">
          <span className="text-foreground static-word-glow">האקר </span>
          <DecryptText 
            text={words[currentWord]} 
            className="text-primary"
          />
        </h1>

        <p className="text-lg sm:text-2xl md:text-3xl text-muted-foreground mb-4 font-medium">
          אימון תודעתי עמוק — לא טיפול, לא פסיכולוגיה.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-secondary mb-8 md:mb-12 font-light">
          תכניס סיסמה. נשום. ברוך הבא אל הקוד שלך.
        </p>

        <Button 
          onClick={scrollToBooking}
          size="lg"
          className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg md:text-xl px-8 py-4 md:px-12 md:py-6 rounded-full cyber-border pulse-glow transition-all duration-300 transform hover:scale-105"
        >
          קבע סשן אונליין
        </Button>

        {/* Vertical energy lines */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-px h-40 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
