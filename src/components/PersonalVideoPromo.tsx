import { Button } from "@/components/ui/button";
import { Video, Sparkles, ArrowLeft, Brain, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersonalVideoPromo = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden" dir="rtl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">מוצר חדש</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 cyber-glow">
            אימון תודעתי אישי
            <span className="block text-accent mt-2">סרטון היפנוזה מותאם במיוחד עבורך</span>
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            קבל סרטון אימון תודעתי מותאם אישית לצרכים הספציפיים שלך - 
            נוצר במיוחד עבורך על ידי דין אזולאי
          </p>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                <Brain className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">התאמה אישית</h3>
              <p className="text-sm text-muted-foreground">סרטון שנוצר במיוחד עבור האתגרים והמטרות שלך</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">גישה לצמיתות</h3>
              <p className="text-sm text-muted-foreground">הסרטון שלך נשאר באזור האישי לתמיד</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">תוצאות אמיתיות</h3>
              <p className="text-sm text-muted-foreground">שיטה מוכחת לשינוי תת-מודע עמוק</p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gap-3 text-lg px-8 py-6 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25"
              onClick={() => navigate("/personal-hypnosis")}
            >
              גלה עוד ורכוש עכשיו
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Price hint */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            ₪297 בלבד | מוכן תוך 2 ימי עסקים
          </p>
        </div>
      </div>
    </section>
  );
};

export default PersonalVideoPromo;
