import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";

const Unsubscribe = () => {
  const { t, isRTL } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not-found" | "already-unsubscribed">("loading");
  const [email, setEmail] = useState<string>("");
  const [isResubscribing, setIsResubscribing] = useState(false);

  useSEO({
    title: isRTL ? "הסרה מרשימת התפוצה" : "Unsubscribe",
    description: isRTL ? "הסרה מניוזלטר Mind OS" : "Unsubscribe from Mind OS newsletter",
    url: `${window.location.origin}/unsubscribe`,
  });

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!token) {
        setStatus("not-found");
        return;
      }

      try {
        // Find subscriber by token
        const { data: subscriber, error } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .eq("unsubscribe_token", token)
          .single();

        if (error || !subscriber) {
          setStatus("not-found");
          return;
        }

        setEmail(subscriber.email);

        if (subscriber.status === "unsubscribed") {
          setStatus("already-unsubscribed");
          return;
        }

        // Unsubscribe
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({ 
            status: "unsubscribed",
            unsubscribed_at: new Date().toISOString()
          })
          .eq("id", subscriber.id);

        if (updateError) {
          throw updateError;
        }

        setStatus("success");

      } catch (error) {
        console.error("Error unsubscribing:", error);
        setStatus("error");
      }
    };

    processUnsubscribe();
  }, [token]);

  const handleResubscribe = async () => {
    if (!token) return;
    
    setIsResubscribing(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          status: "active",
          unsubscribed_at: null
        })
        .eq("unsubscribe_token", token);

      if (error) throw error;

      setStatus("loading");
      // Show success briefly then redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error) {
      console.error("Error resubscribing:", error);
    } finally {
      setIsResubscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="glass-panel p-8 max-w-md w-full text-center relative z-10">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? "מעבד את הבקשה..." : "Processing your request..."}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {isRTL ? "הוסרת מרשימת התפוצה" : "You've been unsubscribed"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? `לא נשלח יותר אימיילים ל-${email}`
                : `We won't send any more emails to ${email}`
              }
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className="w-full"
              >
                {isResubscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "רוצה להירשם מחדש?" : "Want to resubscribe?"}
                  </>
                )}
              </Button>
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                  {isRTL ? "חזרה לאתר" : "Back to site"}
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "already-unsubscribed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {isRTL ? "כבר הוסרת" : "Already unsubscribed"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? "האימייל הזה כבר הוסר מרשימת התפוצה"
                : "This email is already unsubscribed from our newsletter"
              }
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className="w-full"
              >
                {isResubscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "רוצה להירשם מחדש?" : "Want to resubscribe?"}
                  </>
                )}
              </Button>
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                  {isRTL ? "חזרה לאתר" : "Back to site"}
                </Button>
              </Link>
            </div>
          </>
        )}

        {(status === "not-found" || status === "error") && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {isRTL ? "משהו השתבש" : "Something went wrong"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? "הקישור לא תקין או שפג תוקפו"
                : "The link is invalid or has expired"
              }
            </p>
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {isRTL ? "חזרה לאתר" : "Back to site"}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
