import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Sparkles, ArrowLeft, Brain, Star, CheckCircle, Clock, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersonalVideoPromo = () => {
  const navigate = useNavigate();

  const benefits = [
    "סרטון מותאם אישית לאתגרים שלך",
    "נוצר על ידי דין אזולאי במיוחד עבורך",
    "גישה לצמיתות באזור האישי",
    "מוכן תוך 2 ימי עסקים",
    "שיטה מוכחת לשינוי תת-מודע"
  ];

  return (
    <section id="personal-video" className="relative py-20 md:py-32 overflow-hidden" dir="rtl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">מוצר דיגיטלי מותאם אישית</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6">
            סרטון היפנוזה אישי
            <span className="block text-accent mt-2 text-2xl md:text-3xl lg:text-4xl">מותאם במיוחד עבורך</span>
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            קבל סרטון אימון תודעתי שנוצר במיוחד עבור האתגרים והמטרות הספציפיות שלך
          </p>
          
          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left side - Features */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-card/50 backdrop-blur border-accent/20 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">התאמה אישית מלאה</h3>
                  <p className="text-muted-foreground text-sm">סרטון שנוצר במיוחד עבור האתגרים והמטרות שלך</p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-accent/20 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Infinity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">גישה לצמיתות</h3>
                  <p className="text-muted-foreground text-sm">הסרטון שלך נשאר באזור האישי שלך לתמיד</p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-accent/20 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">מוכן במהירות</h3>
                  <p className="text-muted-foreground text-sm">הסרטון שלך יהיה מוכן תוך 2 ימי עסקים</p>
                </div>
              </Card>
            </div>
            
            {/* Right side - Benefits & CTA */}
            <Card className="bg-card/50 backdrop-blur border-accent/30 p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 text-center">מה אתה מקבל?</h3>
              
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">מחיר מיוחד</div>
                <div className="text-4xl font-bold text-accent">₪297</div>
                <div className="text-sm text-muted-foreground mt-1">תשלום חד פעמי</div>
              </div>
              
              <Button
                size="lg"
                className="w-full gap-3 text-lg py-6 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25"
                onClick={() => navigate("/personal-hypnosis")}
              >
                הזמן את הסרטון שלך
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                שאלון קצר ← תשלום ← הסרטון אצלך תוך 48 שעות
              </p>
            </Card>
          </div>
          
          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Video className="h-4 w-4 text-accent" />
              <span className="text-sm">סרטון HD איכותי</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm">תוצאות מוכחות</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm">מותאם אישית 100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalVideoPromo;
