import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { z } from "zod";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";

// Validate redirect path to prevent open redirect attacks
const ALLOWED_REDIRECT_PREFIXES = [
  '/dashboard',
  '/courses',
  '/admin',
  '/success',
  '/subscriptions',
  '/install',
  '/personal-hypnosis',
  '/consciousness-leap',
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

const SignUp = () => {
  const { t, isRTL } = useTranslation();

  // SEO Configuration
  useSEO({
    title: t('seo.signupTitle'),
    description: t('seo.signupDescription'),
    keywords: t('seo.signupKeywords'),
    url: `${window.location.origin}/signup`,
    type: "website",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Create schema with translated messages
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = signUpSchema.safeParse(formData);
    
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
      toast({
        title: t('messages.signupSuccess'),
        description: t('messages.welcomeNew'),
      });

      // Validate redirect to prevent open redirect attacks
      const redirect = searchParams.get("redirect");
      const safeRedirect = validateRedirectPath(redirect);
      navigate(safeRedirect);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-10 w-10 md:h-12 md:w-12 text-primary cyber-glow" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black cyber-glow">{t('auth.signupTitle')}</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('auth.signupSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('auth.fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t('auth.enterFullName')}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
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
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>

            <div className={`flex items-center gap-2 ${isRTL ? '' : 'flex-row-reverse justify-end'}`}>
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal cursor-pointer"
              >
                {t('auth.termsAgree')}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
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

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('auth.hasAccount')}{" "}
              <Link
                to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
                className="text-primary hover:underline font-medium"
              >
                {t('auth.loginNow')}
              </Link>
            </p>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground block"
            >
              {t('auth.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
