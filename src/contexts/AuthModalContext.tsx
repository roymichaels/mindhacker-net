import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface AuthModalContextType {
  openAuthModal: (view?: "login" | "signup", onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  isAuthenticating: boolean;
}

interface AuthModalInternalContextType {
  isAuthFlowOpen: boolean;
  completeAuthFlow: () => void;
  failAuthFlow: (message: string) => void;
  cancelAuthFlow: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthenticating: false,
});

const AuthModalInternalContext = createContext<AuthModalInternalContextType>({
  isAuthFlowOpen: false,
  completeAuthFlow: () => {},
  failAuthFlow: () => {},
  cancelAuthFlow: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);
export const useAuthModalInternal = () => useContext(AuthModalInternalContext);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthFlowOpen, setIsAuthFlowOpen] = useState(false);
  const onSuccessRef = useRef<(() => void) | undefined>();

  const clearAuthFlow = useCallback(() => {
    setIsAuthenticating(false);
    setIsAuthFlowOpen(false);
  }, []);

  const completeAuthFlow = useCallback(() => {
    const onSuccess = onSuccessRef.current;
    onSuccessRef.current = undefined;
    clearAuthFlow();
    onSuccess?.();
  }, [clearAuthFlow]);

  const failAuthFlow = useCallback(
    (message: string) => {
      onSuccessRef.current = undefined;
      clearAuthFlow();
      toast({
        title: "Authentication unavailable",
        description: message,
        variant: "destructive",
      });
    },
    [clearAuthFlow]
  );

  const cancelAuthFlow = useCallback(() => {
    onSuccessRef.current = undefined;
    clearAuthFlow();
  }, [clearAuthFlow]);

  const openAuthModal = useCallback(
    async (_view: "login" | "signup" = "login", onSuccess?: () => void) => {
      if (user?.id) {
        onSuccess?.();
        return;
      }

      onSuccessRef.current = onSuccess;
      setIsAuthenticating(true);
      setIsAuthFlowOpen(true);
    },
    [user?.id]
  );

  const closeAuthModal = useCallback(() => {
    cancelAuthFlow();
  }, [cancelAuthFlow]);

  return (
    <AuthModalInternalContext.Provider
      value={{ isAuthFlowOpen, completeAuthFlow, failAuthFlow, cancelAuthFlow }}
    >
      <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
        {children}
      </AuthModalContext.Provider>
    </AuthModalInternalContext.Provider>
  );
}
