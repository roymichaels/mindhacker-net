import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const ConsciousnessLeapApply = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadName, setLeadName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [currentLifeSituation, setCurrentLifeSituation] = useState("");
  const [whatFeelsStuck, setWhatFeelsStuck] = useState("");
  const [whatToUnderstand, setWhatToUnderstand] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [opennessToProcess, setOpennessToProcess] = useState("");

  useSEO({
    title: "טופס בקשה - קפיצה לתודעה חדשה | מיינד-האקר",
    description: "טופס בקשה להצטרפות לתהליך קפיצה לתודעה חדשה",
    url: `${window.location.origin}/consciousness-leap/apply/${token}`,
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('validate-consciousness-leap-token', {
          body: { token }
        });

        if (error || !data?.valid) {
          setIsValid(false);
        } else {
          setIsValid(true);
          setLeadId(data.leadId);
          setLeadName(data.name || "");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLifeSituation.trim() || !whatFeelsStuck.trim() || 
        !whatToUnderstand.trim() || !whyNow.trim() || !opennessToProcess.trim()) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-consciousness-leap-application', {
        body: {
          leadId,
          currentLifeSituation,
          whatFeelsStuck,
          whatToUnderstand,
          whyNow,
          opennessToProcess
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("שגיאה בשליחת הטופס, נסו שוב");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="bg-card/50 border border-border/50 rounded-2xl p-8 md:p-12">
              <h1 className="text-2xl font-bold mb-4">
                הקישור אינו תקף
              </h1>
              <p className="text-muted-foreground mb-8">
                ייתכן שהקישור פג תוקף או שכבר מילאתם את הטופס.
              </p>
              <Button variant="outline" onClick={() => navigate("/consciousness-leap")}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                לדף התהליך
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="bg-card/50 border border-border/50 rounded-2xl p-8 md:p-12">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h1 className="text-3xl font-bold mb-6">
                תודה שמילאתם
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                אני אעבור על זה ואחזור אליכם אישית,
                <br />
                אם נרגיש שזה נכון לשני הצדדים.
              </p>
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
      
      <main className="pt-24 pb-20 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              לפני שנדבר
            </h1>
            {leadName && (
              <p className="text-xl text-muted-foreground mb-4">
                היי {leadName}
              </p>
            )}
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              זה לא מבחן, לא אבחון, ולא התחייבות.
              <br />
              הטופס הזה עוזר לי להבין איפה אתם נמצאים,
              <br />
              והאם התהליך הזה באמת מתאים לכם.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="currentLifeSituation" className="text-lg">
                  איפה אתם נמצאים עכשיו בחיים?
                </Label>
                <Textarea
                  id="currentLifeSituation"
                  value={currentLifeSituation}
                  onChange={(e) => setCurrentLifeSituation(e.target.value)}
                  placeholder="שתפו בקצרה..."
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="whatFeelsStuck" className="text-lg">
                  מה מרגיש תקוע או לא ברור?
                </Label>
                <Textarea
                  id="whatFeelsStuck"
                  value={whatFeelsStuck}
                  onChange={(e) => setWhatFeelsStuck(e.target.value)}
                  placeholder="שתפו בקצרה..."
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="whatToUnderstand" className="text-lg">
                  מה אתם רוצים להבין או לשנות?
                </Label>
                <Textarea
                  id="whatToUnderstand"
                  value={whatToUnderstand}
                  onChange={(e) => setWhatToUnderstand(e.target.value)}
                  placeholder="שתפו בקצרה..."
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="whyNow" className="text-lg">
                  למה זה עולה עכשיו?
                </Label>
                <Textarea
                  id="whyNow"
                  value={whyNow}
                  onChange={(e) => setWhyNow(e.target.value)}
                  placeholder="שתפו בקצרה..."
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="opennessToProcess" className="text-lg">
                  האם יש פתיחות לתהליך שדורש נוכחות, כנות ועבודה פנימית?
                </Label>
                <Textarea
                  id="opennessToProcess"
                  value={opennessToProcess}
                  onChange={(e) => setOpennessToProcess(e.target.value)}
                  placeholder="שתפו בקצרה..."
                  rows={4}
                  required
                  className="resize-none"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  "לשלוח"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConsciousnessLeapApply;
