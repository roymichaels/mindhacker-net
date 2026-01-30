import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";

const defaultLogo = "/icons/icon-96x96.png?v=4";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();

  const logoUrl = theme.logo_url || defaultLogo;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if user has admin role
        const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
          _user_id: authData.user.id,
          _role: 'admin'
        });

        if (roleError) throw roleError;

        if (!hasAdminRole) {
          await supabase.auth.signOut();
          toast({
            title: t('admin.login.noPermission'),
            description: t('admin.login.noPermissionDesc'),
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        toast({
          title: t('admin.login.success'),
          description: t('admin.login.successDesc'),
        });
        navigate("/admin");
      }
    } catch (error: any) {
      toast({
        title: t('admin.login.error'),
        description: error.message || t('admin.login.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="glass-panel p-8">
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <img src={logoUrl} alt={t('admin.panelTitle')} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-center mb-2 cyber-glow">
            {t('admin.panelTitle')}
          </h1>
          <p className="text-center text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            {t('admin.login.subtitle')}
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                  {t('admin.login.loading')}
                </>
              ) : (
                t('common.login')
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
