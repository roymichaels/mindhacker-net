import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCoachStorefront } from '@/contexts/PractitionerContext';
import { useCoachAuth } from '@/contexts/PractitionerAuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const StorefrontLogin = () => {
  const { practitioner, settings, practitionerSlug } = useCoachStorefront();
  const { login, isAuthenticated } = useCoachAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  
  if (isAuthenticated) {
    navigate(`${baseUrl}/dashboard`);
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) { setError(result.error.errors[0].message); return; }
    setIsLoading(true);
    try {
      const { error } = await login(email, password);
      if (error) setError(error.message);
      else navigate(`${baseUrl}/dashboard`);
    } catch { setError('An unexpected error occurred'); }
    finally { setIsLoading(false); }
  };
  
  if (!practitioner) return null;
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={practitioner.display_name} className="h-16 w-auto mx-auto mb-4" />
          ) : (
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" style={{ backgroundColor: brandColor }}>
              {practitioner.display_name.charAt(0)}
            </div>
          )}
          <CardTitle className="text-2xl">{t('welcomeBack')}</CardTitle>
          <CardDescription>{t('loginToYourAccount')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={isLoading} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: brandColor }}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('loggingIn')}</> : t('login')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {t('dontHaveAccount')}{' '}
              <Link to={`${baseUrl}/signup`} className="font-medium hover:underline" style={{ color: brandColor }}>{t('signUpHere')}</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorefrontLogin;
