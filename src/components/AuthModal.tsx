import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "@/hooks/useTranslation";
import { validateRedirectPath } from "@/lib/auth";
import { trackSignupStart, trackSignupComplete } from "@/hooks/useAnalytics";
import { Link } from "react-router-dom";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
  redirectTo?: string;
}

export const AuthModal = ({ 
  open, 
  onOpenChange, 
  defaultMode = "login",
  redirectTo 
}: AuthModalProps) => {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [isLoading, setIsLoading] = useState(false);

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form data
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setLoginData({ email: "", password: "" });
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });
    }
  }, [open, defaultMode]);

  // Track signup page view
  useEffect(() => {
    if (open && mode === "signup") {
      trackSignupStart();
    }
  }, [open, mode]);

  // Login schema
  const loginSchema = z.object({
    email: z.string()
      .trim()
      .email(t('validation.invalidEmail'))
      .max(255, t('validation.emailTooLong'))
      .toLowerCase(),
    password: z.string()
      .min(1, t('validation.passwordRequired'))
      .max(128, t('validation.passwordTooLong'))
  });

  // Signup schema
  const signUpSchema = z.object({
    fullName: z.string()
      .trim()
      .min(2, t('validation.nameMinLength'))
      .max(100, t('validation.nameMaxLength'))
      .regex(/^[\u0590-\u05FFa-zA-Z\s'-]+$/, t('validation.nameInvalidChars')),
    email: z.string()
      .trim()
      .email(t('validation.invalidEmail'))
      .max(255, t('validation.emailTooLong'))
      .toLowerCase(),
    password: z.string()
      .min(10, t('validation.passwordMinLength'))
      .max(128, t('validation.passwordTooLong'))
      .regex(/[A-Z]/, t('validation.passwordUppercase'))
      .regex(/[a-z]/, t('validation.passwordLowercase'))
      .regex(/[0-9]/, t('validation.passwordNumber'))
      .regex(/[^A-Za-z0-9]/, t('validation.passwordSpecial')),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: t('validation.mustAgreeTerms') })
    })
  }).refine(data => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ["confirmPassword"]
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse(loginData);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: t('validation.validationError'),
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
        title: t('auth.loginError'),
        description: error.message === "Invalid login credentials" 
          ? t('messages.wrongCredentials')
          : error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.user) {
      toast({
        title: t('messages.loginSuccess'),
        description: t('messages.welcomeBack'),
      });

      onOpenChange(false);
      
      // Always redirect to dashboard after login (like major apps)
      // Check if admin to redirect to admin dashboard
      const { data: adminCheck } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .single();
      
      if (redirectTo && !redirectTo.startsWith('/') === false) {
        const safeRedirect = validateRedirectPath(redirectTo);
        navigate(safeRedirect);
      } else {
        // Redirect to appropriate dashboard
        navigate(adminCheck ? '/admin' : '/dashboard');
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signUpSchema.safeParse(signupData);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: t('validation.validationError'),
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: t('auth.signupError'),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.user) {
      trackSignupComplete();
      toast({
        title: t('messages.signupSuccess'),
        description: t('messages.welcomeNew'),
      });

      onOpenChange(false);
      
      // Always redirect new users to dashboard after signup
      if (redirectTo) {
        const safeRedirect = validateRedirectPath(redirectTo);
        navigate(safeRedirect);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-background border border-border shadow-xl z-50 text-gray-900 dark:text-foreground"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            {mode === "login" ? (
              <LogIn className="h-10 w-10 text-primary" />
            ) : (
              <UserPlus className="h-10 w-10 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            {mode === "login" ? t('auth.loginTitle') : t('auth.signupTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "login" ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">{t('auth.email')}</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="example@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">{t('auth.password')}</Label>
              <Input
                id="login-password"
                type="password"
                placeholder={t('auth.enterPassword')}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('common.loggingIn')}
                </>
              ) : (
                t('common.login')
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-fullName">{t('auth.fullName')}</Label>
              <Input
                id="signup-fullName"
                type="text"
                placeholder={t('auth.enterFullName')}
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">{t('auth.email')}</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="example@email.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">{t('auth.password')}</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="signup-confirmPassword"
                type="password"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${isRTL ? '' : 'flex-row-reverse justify-end'}`}>
                <Checkbox
                  id="signup-terms"
                  checked={signupData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setSignupData({ ...signupData, agreeTerms: checked as boolean })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="signup-terms" className="text-sm font-normal cursor-pointer">
                  {t('auth.termsAgreePrefix')}{' '}
                  <Link 
                    to="/terms-of-service" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    {t('auth.termsLink')}
                  </Link>
                  {' '}&{' '}
                  <Link 
                    to="/privacy-policy" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    {t('footer.privacyPolicy')}
                  </Link>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('legal.terms.userAcknowledgment')}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('common.creatingAccount')}
                </>
              ) : (
                t('common.signup')
              )}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? t('auth.noAccount') : t('auth.hasAccount')}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? t('auth.signupNow') : t('auth.loginNow')}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
