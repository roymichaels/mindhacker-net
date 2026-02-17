import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { handleError } from "@/lib/errorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthModal } from "@/components/auth/AuthModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        if (!user) setShowAuthModal(true);
      } catch (error) {
        handleError(error, t('messages.authCheckError'), "ProtectedRoute", t('common.error'));
        setIsAuthenticated(false);
        setShowAuthModal(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setShowAuthModal(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={(open) => {
            setShowAuthModal(open);
            // If they close the modal without logging in, keep it closeable
          }}
          defaultView="login"
        />
        {/* Show a minimal background message when modal is dismissed */}
        {!showAuthModal && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('auth.loginRequired') || 'Please log in to continue'}
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-primary hover:underline font-medium"
            >
              {t('common.login') || 'Log in'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
