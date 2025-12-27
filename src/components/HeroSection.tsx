import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DecryptText from "./DecryptText";
import TrustBadges from "./TrustBadges";
import HeroVideo from "./HeroVideo";
import { ArrowLeft, Zap, Video, Sparkles, Brain } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const words = ["מוח", "תודעה", "חופש", "מציאות", "זהות", "תת־מודע"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-start justify-center px-4 md:vignette pt-24 md:pt-32 pb-20 md:pb-24" style={{ zIndex: 2 }}>
      
      {/* Radial glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 240, 255, 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Consciousness pulse behind headline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[600px] md:h-[900px] border border-primary/30 rounded-full consciousness-pulse pointer-events-none" />

      {/* Sacred geometry background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 border border-primary rounded-full animate-breathe" />
      </div>

      <div className="relative text-center max-w-5xl mx-auto">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 leading-tight mt-4 md:mt-8 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 pb-2 animate-fade-in-up">
          <span className="text-foreground static-word-glow w-full md:w-auto text-center">האקר</span>
          <DecryptText 
            text={words[currentWord]} 
            className="text-primary w-full md:w-auto text-center"
          />
        </h1>

        <p className="text-lg sm:text-2xl md:text-3xl text-muted-foreground mb-4 font-medium opacity-0 animate-fade-in-up-delay-1">
          אני מלווה אותך בתהליך עמוק — לא טיפול, לא פסיכולוגיה.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-secondary mb-6 font-light opacity-0 animate-fade-in-up-delay-2">
          שני מסלולים לשינוי אמיתי. בחר את זה שמתאים לך.
        </p>

        {/* Personal Video Button */}
        <div className="opacity-0 animate-fade-in-up-delay-3 mb-10">
          <HeroVideo />
        </div>

        {/* Two Options Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10 opacity-0 animate-fade-in-up-delay-3">
          {/* Option 1: Consciousness Leap */}
          <Card className="group relative bg-card/50 backdrop-blur border-primary/30 hover:border-primary/60 p-6 md:p-8 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 cursor-pointer overflow-hidden"
            onClick={() => navigate("/consciousness-leap")}>
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-4">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">תהליך מקיף</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3 cyber-glow">קפיצה לתודעה חדשה</h3>
              
              <p className="text-muted-foreground mb-4">
                תהליך טרנספורמציה אישית מעמיק עם ליווי צמוד. 
                לאנשים שמוכנים לשינוי אמיתי ועמוק.
              </p>
              
              <div className="text-3xl font-bold text-primary mb-4">₪1,997</div>
              
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 transition-all">
                גלה אם זה מתאים לך
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </Card>

          {/* Option 2: Personal Hypnosis Video */}
          <Card className="group relative bg-card/50 backdrop-blur border-accent/30 hover:border-accent/60 p-6 md:p-8 transition-all duration-500 hover:shadow-xl hover:shadow-accent/20 cursor-pointer overflow-hidden"
            onClick={() => navigate("/personal-hypnosis")}>
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-8 h-8 text-accent" />
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-3 py-1 mb-4">
                <Brain className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent font-medium">מוצר דיגיטלי</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3">סרטון היפנוזה אישי</h3>
              
              <p className="text-muted-foreground mb-4">
                סרטון אימון תודעתי מותאם אישית לצרכים הספציפיים שלך. 
                נשאר איתך לצמיתות.
              </p>
              
              <div className="text-3xl font-bold text-accent mb-4">₪297</div>
              
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group-hover:shadow-lg group-hover:shadow-accent/25 transition-all">
                הזמן את הסרטון שלך
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Bottom note */}
        <p className="text-muted-foreground text-sm max-w-lg mx-auto mt-6">
          לא בטוח מה מתאים לך? גלול למטה כדי להבין יותר על כל אחד מהמסלולים
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
