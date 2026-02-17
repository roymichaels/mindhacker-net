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

export const useSubscriptionGate = (): SubscriptionGate => {
  const { user } = useAuth();
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  // Check subscription status via Stripe
  const { data: subData, isLoading: subLoading, refetch } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      return data as {
        subscribed: boolean;
        tier: "free" | "pro";
        product_id?: string;
        subscription_end?: string;
        subscription_status?: string;
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // every minute
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
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const isPro = subData?.tier === "pro" && subData?.subscribed === true;
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
    subscriptionEnd: subData?.subscription_end ?? null,
    showUpgradePrompt,
    upgradeFeature,
    dismissUpgrade,
    refetch: () => { refetch(); },
  };
};
