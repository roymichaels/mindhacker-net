import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Zap, Target, Heart, Sparkles, CheckCircle } from "lucide-react";

const ConsciousnessLeapLanding = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatResonated, setWhatResonated] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  useSEO({
    title: "קפיצה לתודעה חדשה | מיינד-האקר",
    description: "תהליך אישי וממוקד לאנשים שנמצאים בצומת אמיתית בחיים ורוצים בהירות, כיוון וחיבור לעצמם.",
    keywords: "תודעה, בהירות, חיבור עצמי, תהליך אישי, דין אזולאי",
    url: `${window.location.origin}/consciousness-leap`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("נא למלא שם ואימייל");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-consciousness-leap-lead', {
        body: { name, email, whatResonated }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("הפרטים נשלחו בהצלחה");
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("שגיאה בשליחת הפרטים, נסו שוב");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="bg-card/50 border border-border/50 rounded-2xl p-8 md:p-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                תודה ששיתפת
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                שלחתי לך מייל עם הצעד הבא.
                <br />
                <br />
                אם זה מרגיש נכון – ממשיכים משם.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה לדף הבית
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">תהליך אישי וממוקד</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight cyber-glow">
              קפיצה לתודעה חדשה
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed max-w-2xl mx-auto">
              תהליך טרנספורמציה אישית עמוקה
              <br />
              לאנשים שמוכנים לשינוי אמיתי
            </p>
            
            <p className="text-lg text-muted-foreground/80 mb-8">
              בהירות. כיוון. חיבור לעצמך.
            </p>
            
            {/* Price Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-card/50 border border-border/50 mb-8">
              <span className="text-3xl md:text-4xl font-bold text-primary">₪1,997</span>
              <span className="text-muted-foreground">תהליך מלא</span>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 md:py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
              מה כולל התהליך
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card/30 border border-border/30 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">מיפוי מעמיק</h3>
                <p className="text-muted-foreground text-sm">
                  הבנה מדויקת של איפה אתה עומד ולאן אתה רוצה להגיע
                </p>
              </div>
              
              <div className="bg-card/30 border border-border/30 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">עבודה תודעתית</h3>
                <p className="text-muted-foreground text-sm">
                  שילוב של היפנוזה, דמיון מודרך ותרגילים תודעתיים
                </p>
              </div>
              
              <div className="bg-card/30 border border-border/30 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">ליווי אישי</h3>
                <p className="text-muted-foreground text-sm">
                  תמיכה לאורך כל התהליך עד להשגת התוצאות
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What This Is */}
        <section className="py-12 px-4">
          <div className="container max-w-2xl mx-auto">
            <div className="bg-card/30 border border-border/30 rounded-2xl p-6 md:p-10">
              <h2 className="text-2xl font-bold mb-8 text-center">
                מה זה ומה זה לא
              </h2>
              
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  זה לא קורס.
                  <br />
                  לא טיפול.
                  <br />
                  לא מוטיבציה.
                  <br />
                  ולא שיחת השראה.
                </p>
                
                <p className="text-muted-foreground">
                  זה תהליך אישי שמיועד לאנשים שרוצים 
                  <strong className="text-foreground"> בהירות, כיוון וחיבור לעצמם</strong>.
                </p>
                
                <p className="text-muted-foreground">
                  המטרה היא לא לתקן אותך – אלא לעזור לך <strong className="text-foreground">לראות ברור</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who Is It For */}
        <section className="py-12 px-4">
          <div className="container max-w-2xl mx-auto">
            <div className="bg-card/30 border border-border/30 rounded-2xl p-6 md:p-10">
              <h2 className="text-2xl font-bold mb-8 text-center">
                למי זה מתאים
              </h2>
              
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  לאנשים שמרגישים שהם בצומת.
                </p>
                <p>
                  שיודעים שמשהו צריך להשתנות, אבל לא בטוחים מה.
                </p>
                <p>
                  שרוצים להבין את עצמם יותר לעומק.
                </p>
                <p className="pt-4 text-foreground font-medium">
                  התהליך הזה לא מתאים לכולם – וזה בסדר.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-xl mx-auto">
            <div className="bg-card/50 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg shadow-primary/5">
              <h2 className="text-2xl font-bold mb-4 text-center">
                אם זה מרגיש נכון
              </h2>
              <p className="text-center text-muted-foreground mb-2">
                אפשר להשאיר פרטים ולהמשיך משם
              </p>
              <p className="text-center text-sm text-primary font-medium mb-8">
                ₪1,997 לתהליך המלא
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">שם</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="השם שלך"
                    required
                    className="text-lg py-6"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="האימייל שלך"
                    required
                    className="text-lg py-6"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatResonated" className="text-muted-foreground">
                    מה גרם לך להרגיש שזה מדבר אליך? (אופציונלי)
                  </Label>
                  <Textarea
                    id="whatResonated"
                    value={whatResonated}
                    onChange={(e) => setWhatResonated(e.target.value)}
                    placeholder="אפשר לשתף כמה מילים..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    "להמשיך לתהליך"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ConsciousnessLeapLanding;
