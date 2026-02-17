import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { z } from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { trackSignupComplete } from '@/hooks/useAnalytics';
import { Link } from 'react-router-dom';

type AuthView = 'login' | 'signup';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: AuthView;
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, defaultView = 'login', onSuccess }: AuthModalProps) {
  const { t, isRTL } = useTranslation();
  const [view, setView] = useState<AuthView>(defaultView);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Signup form
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const loginSchema = z.object({
    email: z.string().trim().email(t('validation.invalidEmail')).max(255).toLowerCase(),
    password: z.string().min(1, t('validation.passwordRequired')).max(128),
  });

  const signUpSchema = z.object({
    fullName: z.string().trim().min(2, t('validation.nameMinLength')).max(100, t('validation.nameMaxLength'))
      .regex(/^[\u0590-\u05FFa-zA-Z\s'-]+$/, t('validation.nameInvalidChars')),
    email: z.string().trim().email(t('validation.invalidEmail')).max(255).toLowerCase(),
    password: z.string().min(10, t('validation.passwordMinLength')).max(128)
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
    path: ['confirmPassword']
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      toast({ title: t('validation.validationError'), description: result.error.errors[0].message, variant: 'destructive' });
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
        description: error.message === 'Invalid login credentials' ? t('messages.wrongCredentials') : error.message,
        variant: 'destructive',
      });
      return;
    }
    if (data.user) {
      toast({ title: t('messages.loginSuccess'), description: t('messages.welcomeBack') });
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUpSchema.safeParse(signupData);
    if (!result.success) {
      toast({ title: t('validation.validationError'), description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setIsLoading(false);
    if (error) {
      toast({ title: t('auth.signupError'), description: error.message, variant: 'destructive' });
      return;
    }
    if (data.user) {
      trackSignupComplete();
      toast({ title: t('messages.signupSuccess'), description: t('messages.welcomeNew') });
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setLoginData({ email: '', password: '' });
    setSignupData({ fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-primary">
            {view === 'login' ? (
              <><LogIn className="h-5 w-5" /> {t('auth.loginTitle')}</>
            ) : (
              <><UserPlus className="h-5 w-5" /> {t('auth.signupTitle')}</>
            )}
          </DialogTitle>
        </DialogHeader>

        {view === 'login' ? (
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin me-2" />{t('common.loggingIn')}</> : t('common.login')}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={() => switchView('signup')} className="text-primary hover:underline font-medium">
                {t('auth.signupNow')}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder={t('auth.enterFullName')}
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                required
                disabled={isLoading}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${isRTL ? '' : 'flex-row-reverse justify-end'}`}>
                <Checkbox
                  id="modal-terms"
                  checked={signupData.agreeTerms}
                  onCheckedChange={(checked) => setSignupData({ ...signupData, agreeTerms: checked as boolean })}
                  disabled={isLoading}
                />
                <Label htmlFor="modal-terms" className="text-sm font-normal cursor-pointer">
                  {t('auth.termsAgreePrefix')}{' '}
                  <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">{t('auth.termsLink')}</Link>
                  {' & '}
                  <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">{t('footer.privacyPolicy')}</Link>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">{t('legal.terms.userAcknowledgment')}</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin me-2" />{t('common.creatingAccount')}</> : t('common.signup')}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <button type="button" onClick={() => switchView('login')} className="text-primary hover:underline font-medium">
                {t('auth.loginNow')}
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
