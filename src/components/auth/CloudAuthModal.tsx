import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthModalInternal } from "@/contexts/AuthModalContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function CloudAuthModal() {
  const { isAuthFlowOpen, completeAuthFlow, cancelAuthFlow, failAuthFlow } = useAuthModalInternal();
  const { isRTL } = useTranslation();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast({
          title: isRTL ? "בדקו את האימייל" : "Check your email",
          description: isRTL
            ? "אשרו את כתובת האימייל שלכם כדי לסיים את ההרשמה."
            : "Confirm your address to finish signing up.",
        });
        completeAuthFlow();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: isRTL ? "התחברתם" : "Signed in" });
        completeAuthFlow();
      }
    } catch (err: any) {
      failAuthFlow(err?.message || (isRTL ? "ההזדהות נכשלה" : "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        toast({ title: isRTL ? "התחברתם" : "Signed in" });
        completeAuthFlow();
      }
    } catch (err: any) {
      failAuthFlow(err?.message || (isRTL ? "ההתחברות עם Google נכשלה" : "Google sign-in failed"));
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAuthFlowOpen} onOpenChange={(open) => !open && cancelAuthFlow()}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={isRTL ? "text-right" : undefined}>
            {isRTL ? "ברוכים הבאים" : "Welcome"}
          </DialogTitle>
          <DialogDescription className={isRTL ? "text-right" : undefined}>
            {isRTL
              ? "התחברו או פתחו חשבון חדש כדי להמשיך."
              : "Sign in or create an account to continue."}
          </DialogDescription>
        </DialogHeader>

        <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="w-full">
          {isRTL ? "המשיכו עם Google" : "Continue with Google"}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {isRTL ? "או" : "or"}
            </span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{isRTL ? "התחברות" : "Sign in"}</TabsTrigger>
            <TabsTrigger value="signup">{isRTL ? "הרשמה" : "Sign up"}</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            <form onSubmit={handleEmailAuth} className="space-y-3 pt-3">
              <div className="space-y-1">
                <Label htmlFor="email">{isRTL ? "אימייל" : "Email"}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">{isRTL ? "סיסמה" : "Password"}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className={`${isRTL ? "ms-2" : "mr-2"} h-4 w-4 animate-spin`} />}
                {tab === "signup"
                  ? (isRTL ? "פתחו חשבון" : "Create account")
                  : (isRTL ? "התחברו" : "Sign in")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}