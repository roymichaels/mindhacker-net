import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthModalContextType {
  openAuthModal: (view?: "login" | "signup", onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  isAuthenticating: boolean;
}

const AUTH_RETURN_TO_KEY = "mindos_auth_return_to";

const AuthModalContext = createContext<AuthModalContextType>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthenticating: false,
});

export const useAuthModal = () => useContext(AuthModalContext);

const getCurrentLocation = () => {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
};

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "TOKEN_REFRESHED") return;

      setIsAuthenticating(false);

      const returnTo = sessionStorage.getItem(AUTH_RETURN_TO_KEY);
      if (!returnTo) return;

      sessionStorage.removeItem(AUTH_RETURN_TO_KEY);

      const current = getCurrentLocation();
      if (returnTo !== current) {
        window.location.replace(returnTo);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback(
    async (_view: "login" | "signup" = "login", onSuccess?: () => void) => {
      setIsAuthenticating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticating(false);
        onSuccess?.();
        return;
      }

      const returnTo = getCurrentLocation();
      sessionStorage.setItem(AUTH_RETURN_TO_KEY, returnTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${returnTo}`,
        },
      });

      if (error) {
        setIsAuthenticating(false);
        sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
        toast({
          title: "Authentication unavailable",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthenticating(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
      {children}
    </AuthModalContext.Provider>
  );
}
