import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";

export interface SubscriptionGate {
  tier: "free" | "pro";
  isPro: boolean;
  isLoading: boolean;
  canSendMessage: boolean;
  messagesRemaining: number;
  canAccessPlan: boolean;
  canAccessHypnosis: boolean;
  canAccessNudges: boolean;
  maxHabits: number;
  subscriptionEnd: string | null;
  showUpgradePrompt: (feature: string) => void;
  upgradeFeature: string | null;
  dismissUpgrade: () => void;
  refetch: () => void;
}

const FREE_DAILY_MESSAGES = 5;
const FREE_MAX_HABITS = 3;
const PRO_PRODUCT_ID = "prod_TzbSX1sFG1woDZ";

export const useSubscriptionGate = (): SubscriptionGate => {
  const { user, isAdmin } = useAuth();
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  // Check subscription status via Stripe
  const { data: subData, isLoading: subLoading, refetch } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("status, product_id, end_date, cancel_at_period_end")
        .eq("user_id", user!.id)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !isAdmin,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Get daily message count
  const { data: messageData } = useQuery({
    queryKey: ["daily-message-count", user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_message_counts")
        .select("count")
        .eq("user_id", user!.id)
        .eq("message_date", today)
        .maybeSingle();
      if (error) throw error;
      return data?.count ?? 0;
    },
    enabled: !!user && !isAdmin,
    staleTime: 30 * 1000,
  });

  // Admins bypass all gates
  if (isAdmin) {
    return {
      tier: "pro",
      isPro: true,
      isLoading: false,
      canSendMessage: true,
      messagesRemaining: Infinity,
      canAccessPlan: true,
      canAccessHypnosis: true,
      canAccessNudges: true,
      maxHabits: Infinity,
      subscriptionEnd: null,
      showUpgradePrompt: () => {},
      upgradeFeature: null,
      dismissUpgrade: () => {},
      refetch: () => {},
    };
  }

  const isPro = !!subData && subData.product_id === PRO_PRODUCT_ID;
  const dailyCount = messageData ?? 0;
  const messagesRemaining = isPro ? Infinity : Math.max(0, FREE_DAILY_MESSAGES - dailyCount);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
  }, []);

  const dismissUpgrade = useCallback(() => {
    setUpgradeFeature(null);
  }, []);

  return {
    tier: isPro ? "pro" : "free",
    isPro,
    isLoading: subLoading,
    canSendMessage: isPro || messagesRemaining > 0,
    messagesRemaining,
    canAccessPlan: isPro,
    canAccessHypnosis: isPro,
    canAccessNudges: isPro,
    maxHabits: isPro ? Infinity : FREE_MAX_HABITS,
    subscriptionEnd: subData?.end_date ?? null,
    showUpgradePrompt,
    upgradeFeature,
    dismissUpgrade,
    refetch: () => { refetch(); },
  };
};
