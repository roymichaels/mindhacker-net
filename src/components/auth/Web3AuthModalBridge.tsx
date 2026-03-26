import { useCallback, useEffect, useState } from "react";
import {
  useIdentityToken,
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { exchangeForSupabaseSession } from "@/lib/web3auth";
import { useAuthModalInternal } from "@/contexts/AuthModalContext";
import { useWeb3AuthReady } from "@/providers/Web3AuthProviderWrapper";
import { toast } from "@/hooks/use-toast";

function Web3AuthModalBridgeInner() {
  const [isBridging, setIsBridging] = useState(false);
  const {
    isAuthFlowOpen,
    completeAuthFlow,
    failAuthFlow,
    cancelAuthFlow,
  } = useAuthModalInternal();
  const { isInitialized, isInitializing, isConnected, initError } = useWeb3Auth();
  const { connect, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { getIdentityToken } = useIdentityToken();

  const getInitErrorMessage = useCallback(() => {
    if (!initError) return null;
    if (typeof initError === "string") return initError;
    if (typeof initError === "object" && initError !== null) {
      const maybeError = initError as { message?: string; cause?: { message?: string } };
      return maybeError.message || maybeError.cause?.message || "Authentication initialization failed.";
    }
    return "Authentication initialization failed.";
  }, [initError]);

  const openWeb3Auth = useCallback(async () => {
    try {
      console.info("[Web3Auth] Opening SDK modal...");
      await connect();
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("user closed") || message.includes("popup") || err?.code === 5000) {
        cancelAuthFlow();
        return;
      }
      console.error("[Web3Auth] Connect error:", err);
      failAuthFlow(message || "Connection failed");
    }
  }, [cancelAuthFlow, connect, failAuthFlow]);

  useEffect(() => {
    if (!isAuthFlowOpen) return;
    const initMessage = getInitErrorMessage();
    if (!initMessage) return;

    console.error("[Web3Auth] Init error:", initError);
    failAuthFlow(initMessage);
  }, [failAuthFlow, getInitErrorMessage, initError, isAuthFlowOpen]);

  useEffect(() => {
    if (!isAuthFlowOpen || isInitializing || isBridging || connectLoading) return;
    if (initError || isConnected || !isInitialized) return;

    void openWeb3Auth();
  }, [
    connectLoading,
    initError,
    isAuthFlowOpen,
    isBridging,
    isConnected,
    isInitialized,
    isInitializing,
    openWeb3Auth,
  ]);

  useEffect(() => {
    if (!isAuthFlowOpen || !isConnected || !userInfo?.email || isBridging) return;

    let cancelled = false;
    const bridgeSession = async () => {
      setIsBridging(true);
      try {
        let idToken: string | undefined;
        try {
          idToken = (await getIdentityToken()) || undefined;
        } catch {
          console.warn("[Web3Auth] Could not get identity token for Supabase bridge.");
        }

        await exchangeForSupabaseSession({
          email: userInfo.email,
          name: userInfo.name,
          idToken,
        });

        if (cancelled) return;

        toast({
          title: "Signed in",
          description: "Web3Auth session connected successfully.",
        });
        completeAuthFlow();
      } catch (err: any) {
        if (cancelled) return;
        console.error("[Web3Auth] Supabase bridge error:", err);
        failAuthFlow(err?.message || "Failed to complete authentication.");
      } finally {
        if (!cancelled) setIsBridging(false);
      }
    };

    void bridgeSession();

    return () => {
      cancelled = true;
    };
  }, [
    completeAuthFlow,
    failAuthFlow,
    getIdentityToken,
    isAuthFlowOpen,
    isBridging,
    isConnected,
    userInfo?.email,
    userInfo?.name,
  ]);

  return null;
}

export default function Web3AuthModalBridge() {
  const isWeb3AuthReady = useWeb3AuthReady();

  if (!isWeb3AuthReady) {
    return null;
  }

  return <Web3AuthModalBridgeInner />;
}
