import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalHypnosisCheckoutDialog } from "@/components/checkout/PersonalHypnosisCheckoutDialog";
import { useSEO } from "@/hooks/useSEO";
import { 
  Brain, 
  Sparkles, 
  Clock, 
  Video, 
  CheckCircle2, 
  MessageCircle, 
  Clapperboard, 
  Send,
  Star,
  Play
} from "lucide-react";

const PersonalHypnosisLanding = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: "אימון תודעתי אישי - סרטון היפנוזה בהתאמה אישית | מיינד-האקר",
    description: "סרטון היפנוזה ואימון תודעתי בהתאמה אישית לשחרור מגבלות ויצירת חופש פנימי אמיתי. 10 דקות ביום לשינוי עמוק ומתמשך.",
    keywords: "היפנוזה אישית, אימון תודעתי, סרטון היפנוזה, שחרור מגבלות, חופש פנימי, דין אזולאי",
    url: `${window.location.origin}/personal-hypnosis`,
  });

  const handlePurchase = () => {
    if (!user) {
      navigate("/login?redirect=/personal-hypnosis");
      return;
    }
    setCheckoutOpen(true);
  };

  const painPoints = [
    { icon: Brain, text: "מרגיש תקוע באותם דפוסים שוב ושוב?" },
    { icon: Sparkles, text: "יודע שיש בך יותר אבל משהו מעכב אותך?" },
    { icon: Clock, text: "ניסית הכל אבל השינוי לא מחזיק?" },
  ];

  const processSteps = [
    { icon: MessageCircle, title: "1. רוכשים עכשיו", desc: "תהליך רכישה פשוט ומאובטח" },
    { icon: Clapperboard, title: "2. אני יוצר לך סרטון אישי", desc: "תוך 2 ימי עסקים, מותאם בדיוק אליך" },
    { icon: Send, title: "3. מקבלים גישה", desc: "התראה + גישה מיידית לאזור האישי" },
    { icon: Play, title: "4. צופים כל יום", desc: "10 דקות ביום = שינוי מצטבר עמוק" },
  ];

  const benefits = [
    "סרטון אימון תודעתי בהתאמה אישית",
    "10 דקות ביום בלבד",
    "אפקט מצטבר עם כל צפייה",
    "גישה לצמיתות מכל מכשיר",
    "תמיכה אישית לאורך הדרך",
  ];

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.01)_50%)] bg-[length:100%_4px] opacity-10" style={{ zIndex: 1 }} />
      
      <Header />
      
      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary mb-6 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">הקלטה בהתאמה אישית</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 cyber-glow animate-fade-in-up-delay-1">
              אימון תודעתי אישי
              <br />
              <span className="text-primary">סרטון היפנוזה בהתאמה אישית</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up-delay-2">
              סרטון אימון תודעתי מותאם אישית שנוצר עבורך בלבד, 
              לפתיחת חסימות ויצירת שינוי עמוק ומתמשך בתודעה
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3">
              <Button size="lg" onClick={handlePurchase} className="text-lg px-8 py-6 pulse-glow">
                רכוש עכשיו ב-297₪
              </Button>
              <span className="text-sm text-muted-foreground">תשלום מאובטח • גישה לצמיתות</span>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              האם אתה מכיר את התחושות האלה?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {painPoints.map((point, i) => (
                <Card key={i} className="glass-panel hover-lift">
                  <CardContent className="p-6 text-center">
                    <point.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <p className="text-lg">{point.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              איך זה עובד?
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              תהליך פשוט ב-4 שלבים להקלטה אישית שלך
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, i) => (
                <Card key={i} className="glass-panel relative overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-accent/10 border border-accent/30 rounded-xl text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-accent font-medium">
                הסרטון יהיה מוכן תוך 2 ימי עסקים מרגע הרכישה
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              מה כלול ברכישה?
            </h2>
            
            <div className="glass-panel p-8 max-w-xl mx-auto">
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-4">
          <div className="container max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl italic text-muted-foreground mb-6">
              "הסרטון הזה שינה לי את החיים. תוך שבועיים הרגשתי שינוי משמעותי בביטחון העצמי שלי."
            </blockquote>
            <p className="font-medium">— לקוח מרוצה</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="glass-panel p-8 md:p-12 cyber-border">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 cyber-glow">
                מוכן לשינוי?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                תן לעצמך את ההזדמנות לחוות שחרור אמיתי עם הקלטה שנוצרת במיוחד עבורך
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">₪297</span>
                <span className="text-muted-foreground mr-2">תשלום חד פעמי</span>
              </div>
              
              <Button size="lg" onClick={handlePurchase} className="text-lg px-10 py-6 w-full sm:w-auto pulse-glow">
                <Video className="h-5 w-5 ml-2" />
                רכוש את הסרטון האישי שלך
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                * הסרטון יהיה מוכן תוך 2 ימי עסקים
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <PersonalHypnosisCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      />
    </div>
  );
};

export default PersonalHypnosisLanding;
