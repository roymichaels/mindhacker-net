import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";
import { SubscriptionTier, productIdToTier, tierIncludes } from "@/lib/subscriptionTiers";

export interface SubscriptionGate {
  tier: SubscriptionTier;
  isPro: boolean;
  isLoading: boolean;
  canSendMessage: boolean;
  messagesRemaining: number;
  canAccessPlan: boolean;
  canAccessHypnosis: boolean;
  canAccessNudges: boolean;
  canBeCoach: boolean;
  canAccessBusiness: boolean;
  maxHabits: number;
  subscriptionEnd: string | null;
  showUpgradePrompt: (feature: string) => void;
  upgradeFeature: string | null;
  dismissUpgrade: () => void;
  refetch: () => void;
}

const FREE_DAILY_MESSAGES = 5;
const FREE_MAX_HABITS = 3;

export const useSubscriptionGate = (): SubscriptionGate => {
  const { user, isAdmin } = useAuth();
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

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
      tier: "business",
      isPro: true,
      isLoading: false,
      canSendMessage: true,
      messagesRemaining: Infinity,
      canAccessPlan: true,
      canAccessHypnosis: true,
      canAccessNudges: true,
      canBeCoach: true,
      canAccessBusiness: true,
      maxHabits: Infinity,
      subscriptionEnd: null,
      showUpgradePrompt: () => {},
      upgradeFeature: null,
      dismissUpgrade: () => {},
      refetch: () => {},
    };
  }

  const tier: SubscriptionTier = subData ? productIdToTier(subData.product_id) : "free";
  const isPaid = tier !== "free";
  const dailyCount = messageData ?? 0;
  const messagesRemaining = isPaid ? Infinity : Math.max(0, FREE_DAILY_MESSAGES - dailyCount);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
  }, []);

  const dismissUpgrade = useCallback(() => {
    setUpgradeFeature(null);
  }, []);

  return {
    tier,
    isPro: isPaid, // backward compat: true for any paid tier
    isLoading: subLoading,
    canSendMessage: isPaid || messagesRemaining > 0,
    messagesRemaining,
    canAccessPlan: true, // now free for all
    canAccessHypnosis: tierIncludes(tier, "pro"),
    canAccessNudges: tierIncludes(tier, "pro"),
    canBeCoach: tierIncludes(tier, "coach"),
    canAccessBusiness: tierIncludes(tier, "business"),
    maxHabits: isPaid ? Infinity : FREE_MAX_HABITS,
    subscriptionEnd: subData?.end_date ?? null,
    showUpgradePrompt,
    upgradeFeature,
    dismissUpgrade,
    refetch: () => { refetch(); },
  };
};
