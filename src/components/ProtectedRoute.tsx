import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { handleError } from "@/lib/errorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthModal } from "@/components/auth/AuthModal";
import { flowAudit } from "@/lib/flowAudit";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        if (!user) {
          flowAudit.redirect(window.location.pathname, '(auth_modal)', 'No authenticated user — showing auth modal');
          setShowAuthModal(true);
        }
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
            if (!open) {
              // Redirect to homepage when modal is dismissed without logging in
              flowAudit.redirect(window.location.pathname, '/', 'Auth modal dismissed without login');
              navigate('/', { replace: true });
            }
          }}
          defaultView="login"
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
