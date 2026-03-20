import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { handleError } from "@/lib/errorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { flowAudit } from "@/lib/flowAudit";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        if (!user) {
          flowAudit.redirect(window.location.pathname, '(auth_modal)', 'No authenticated user — showing auth modal');
          // Directly open the Web3Auth SDK modal
          openAuthModal('login', () => {
            setIsAuthenticated(true);
          });
        }
      } catch (error) {
        handleError(error, t('messages.authCheckError'), "ProtectedRoute", t('common.error'));
        setIsAuthenticated(false);
        openAuthModal('login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
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
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
