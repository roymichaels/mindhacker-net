import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const PersonalHypnosisPending = () => {
  useSEO({
    title: "ההזמנה התקבלה | אימון תודעתי אישי",
    description: "ההזמנה שלך התקבלה בהצלחה. תקבל בקרוב הוראות תשלום.",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="glass-panel p-8 space-y-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black cyber-glow">
              ההזמנה התקבלה בהצלחה!
            </h1>
            <p className="text-muted-foreground">
              תודה על פנייתך. אנחנו שמחים שבחרת באימון תודעתי אישי.
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4 text-right">
            <h2 className="font-bold text-lg">מה קורה עכשיו?</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium text-accent">שלב 1: הוראות תשלום</h3>
                  <p className="text-sm text-muted-foreground">
                    תוך 24 שעות תקבל מייל עם הוראות תשלום מפורטות.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium">שלב 2: אישור תשלום</h3>
                  <p className="text-sm text-muted-foreground">
                    לאחר ביצוע התשלום, נאשר את קבלתו ונתחיל בהכנת הסרטון.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium">שלב 3: הסרטון שלך מוכן</h3>
                  <p className="text-sm text-muted-foreground">
                    תוך 2 ימי עסקים לאחר אישור התשלום, תקבל התראה שהסרטון שלך מוכן לצפייה.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Link to="/dashboard">
              <Button className="w-full" size="lg">
                <ArrowRight className="h-4 w-4 ml-2" />
                לאזור האישי
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="h-4 w-4 ml-2" />
                חזרה לעמוד הבית
              </Button>
            </Link>
          </div>

          {/* Contact Note */}
          <p className="text-xs text-muted-foreground pt-4">
            יש לך שאלות? ניתן ליצור קשר דרך וואטסאפ או המייל.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalHypnosisPending;
