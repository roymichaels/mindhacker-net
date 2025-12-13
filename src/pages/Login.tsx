import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogIn } from "lucide-react";
import { z } from "zod";
import { useSEO } from "@/hooks/useSEO";

const loginSchema = z.object({
  email: z.string()
    .trim()
    .email("כתובת אימייל לא חוקית")
    .max(255, "כתובת אימייל ארוכה מדי")
    .toLowerCase(),
  
  password: z.string()
    .min(1, "נא להזין סיסמה")
    .max(128, "סיסמה ארוכה מדי")
});

// Validate redirect path to prevent open redirect attacks
const ALLOWED_REDIRECT_PREFIXES = [
  '/dashboard',
  '/courses',
  '/admin',
  '/success',
  '/subscriptions',
  '/install',
  '/'
];

const validateRedirectPath = (redirect: string | null): string => {
  if (!redirect) return '/dashboard';
  
  // Must start with single / and not // (prevents protocol-relative URLs)
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/dashboard';
  }
  
  // Check against whitelist of allowed prefixes
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(prefix => 
    redirect === prefix || redirect.startsWith(prefix + '/') || redirect.startsWith(prefix + '?')
  );
  
  return isAllowed ? redirect : '/dashboard';
};

const Login = () => {
  // SEO Configuration
  useSEO({
    title: "התחברות | מיינד-האקר",
    description: "התחבר לחשבון שלך במיינד-האקר וקבל גישה למוצרים הדיגיטליים, הקורסים והסדנאות שרכשת.",
    url: `${window.location.origin}/login`,
    type: "website",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "שגיאת אימות",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "שגיאה בהתחברות",
        description: error.message === "Invalid login credentials" 
          ? "אימייל או סיסמה שגויים"
          : error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.user) {
      toast({
        title: "התחברת בהצלחה!",
        description: "ברוך הבא חזרה",
      });

      // Validate redirect to prevent open redirect attacks
      const redirect = searchParams.get("redirect");
      const safeRedirect = validateRedirectPath(redirect);
      navigate(safeRedirect);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <LogIn className="h-10 w-10 md:h-12 md:w-12 text-primary cyber-glow" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black cyber-glow">התחברות</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              התחבר לחשבון שלך
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="הכנס סיסמה"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                "התחבר"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              אין לך חשבון?{" "}
              <Link
                to={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
                className="text-primary hover:underline font-medium"
              >
                הרשם עכשיו
              </Link>
            </p>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground block"
            >
              חזור לעמוד הראשי
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
