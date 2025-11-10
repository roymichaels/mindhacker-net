import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const HeroSection = () => {
  const words = ["מוח", "תודעה", "חופש", "מציאות", "זהות"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ zIndex: 2 }}>
      {/* Sacred geometry background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-primary rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-primary-glow rotate-45 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/3 w-32 h-32 border border-secondary animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative text-center max-w-4xl mx-auto">
        <div className="mb-8 flex justify-center">
          <Brain className="w-16 h-16 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
          <span className="text-foreground">האקר </span>
          <span className="cyber-glow text-primary transition-all duration-500">
            {words[currentWord]}
          </span>
        </h1>

        <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-medium">
          אימון תודעתי עמוק — לא טיפול, לא פסיכולוגיה.
        </p>

        <p className="text-lg md:text-xl text-secondary mb-12 font-light">
          תכניס סיסמה. נשום. ברוך הבא אל הקוד שלך.
        </p>

        <Button 
          onClick={scrollToBooking}
          size="lg"
          className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-xl px-12 py-6 rounded-full cyber-border pulse-glow transition-all duration-300 transform hover:scale-105"
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
