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
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const StorefrontSignup = () => {
  const { practitioner, settings, practitionerSlug } = useCoachStorefront();
  const { signup, isAuthenticated } = useCoachAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  
  if (isAuthenticated) { navigate(`${baseUrl}/dashboard`); return null; }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = signupSchema.safeParse({ name, email, password });
    if (!result.success) { setError(result.error.errors[0].message); return; }
    setIsLoading(true);
    try {
      const { error } = await signup(email, password, name);
      if (error) {
        setError(error.message.includes('already registered') ? t('emailAlreadyRegistered') : error.message);
      } else { setSuccess(true); }
    } catch { setError('An unexpected error occurred'); }
    finally { setIsLoading(false); }
  };
  
  if (!practitioner) return null;
  
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}20` }}>
              <CheckCircle className="h-8 w-8" style={{ color: brandColor }} />
            </div>
            <CardTitle className="text-2xl">{t('checkYourEmail')}</CardTitle>
            <CardDescription>{t('confirmationEmailSent')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{t('clickLinkToActivate')}</p>
            <Button variant="outline" asChild><Link to={`${baseUrl}/login`}>{t('backToLogin')}</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
          <CardTitle className="text-2xl">{t('createAccount')}</CardTitle>
          <CardDescription>{t('joinCommunity')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" type="text" placeholder={t('yourName')} value={name} onChange={(e) => setName(e.target.value)} className="pl-10" disabled={isLoading} />
              </div>
            </div>
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
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('creatingAccount')}</> : t('createAccount')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {t('alreadyHaveAccount')}{' '}
              <Link to={`${baseUrl}/login`} className="font-medium hover:underline" style={{ color: brandColor }}>{t('loginHere')}</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorefrontSignup;
