import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConsciousnessLeapPromo = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden" dir="rtl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-36 h-36 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">תהליך אישי וממוקד</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 cyber-glow">
            קפיצה לתודעה חדשה
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            תהליך אישי וממוקד לאנשים בצומת אמיתית בחיים
          </p>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-10">
            בהירות, כיוון, וחיבור לעצמך
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Compass className="h-4 w-4 text-accent" />
              <span className="text-sm">תהליך סלקטיבי</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">ליווי אישי מלא</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <Button
            size="lg"
            className="gap-3 text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
            onClick={() => navigate("/consciousness-leap")}
          >
            גלה אם זה מתאים לך
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            לא כל אחד מתאים לתהליך הזה - ולזה יש סיבה טובה
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConsciousnessLeapPromo;
