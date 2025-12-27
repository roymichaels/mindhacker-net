import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import { CheckCircle2, Clock, Bell, Video, ArrowLeft } from "lucide-react";

const PersonalHypnosisSuccess = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: CheckCircle2,
      title: "הרכישה בוצעה בהצלחה!",
      desc: "התשלום התקבל ואנחנו מתחילים לעבוד על הסרטון שלך",
      done: true,
    },
    {
      icon: Clock,
      title: "יצירת הסרטון האישי",
      desc: "תוך 2 ימי עסקים, הסרטון יהיה מוכן",
      done: false,
    },
    {
      icon: Bell,
      title: "נודיע לך כשמוכן",
      desc: "תקבל התראה באתר ברגע שהסרטון מוכן לצפייה",
      done: false,
    },
    {
      icon: Video,
      title: "מתחילים לצפות",
      desc: "גישה לצמיתות מאזור האישי שלך",
      done: false,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.01)_50%)] bg-[length:100%_4px] opacity-10" style={{ zIndex: 1 }} />
      
      <Header />
      
      <main className="relative pt-32 pb-20 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 cyber-glow">
              תודה על הרכישה! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              הסרטון האישי שלך בדרך אליך
            </p>
          </div>

          {/* Timeline */}
          <Card className="glass-panel mb-8">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-center">מה קורה עכשיו?</h2>
              
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center shrink-0
                      ${step.done 
                        ? "bg-green-500/20 border-2 border-green-500" 
                        : "bg-muted border-2 border-border"
                      }
                    `}>
                      <step.icon className={`h-5 w-5 ${step.done ? "text-green-500" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 pb-6 border-r-2 border-dashed border-border pr-4 last:border-0 last:pb-0">
                      <h3 className={`font-medium mb-1 ${step.done ? "text-green-500" : ""}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-center mb-8">
            <Clock className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-accent font-medium">
              הסרטון יהיה מוכן תוך 2 ימי עסקים
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              נשלח לך התראה ברגע שיהיה מוכן
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              לאזור האישי
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              חזרה לדף הבית
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalHypnosisSuccess;
