import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useRef, useEffect } from "react";
import { SubscriptionTier, productIdToTier, tierIncludes } from "@/lib/subscriptionTiers";
import { flowAudit } from "@/lib/flowAudit";

export interface SubscriptionGate {
  tier: SubscriptionTier;
  isApex: boolean;
  isPlus: boolean;
  isLoading: boolean;
  canSendMessage: boolean;
  messagesRemaining: number;
  // Depth gates (new philosophy: gate depth, not access)
  canAccessFullPillars: boolean;      // Plus+ — full pillar engines (vs assessment-only for Free)
  canAccessCombat: boolean;           // Plus+ — Combat pillar locked for Free
  canAccessHypnosis: boolean;         // Plus+ — AI hypnosis
  canAccessNudges: boolean;           // Plus+ — basic proactive nudges
  canAccessArenaFull: boolean;        // Plus+ — full Arena (Free = view-only)
  canAccessBusinessBasic: boolean;    // Plus+ — business module basic
  canAccessPlanRecalibration: boolean;// Plus+ — 90-day recalibration
  canAccessFullProactive: boolean;    // Apex — full proactive engine
  canAccessProjects: boolean;         // Apex — Projects module
  canAccessBusinessAdvanced: boolean; // Apex — Business advanced + AI plans
  canAccessOrbDNA: boolean;           // Apex — Full 70-variable Orb DNA
  maxHabits: number;
  subscriptionEnd: string | null;
  showUpgradePrompt: (feature: string) => void;
  upgradeFeature: string | null;
  dismissUpgrade: () => void;
  refetch: () => void;
  // Legacy compat aliases
  isPro: boolean;
  canAccessCore: boolean;
  canAccessArena: boolean;
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

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
  }, []);

  const dismissUpgrade = useCallback(() => {
    setUpgradeFeature(null);
  }, []);

  const subStuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (subLoading) {
      subStuckTimer.current = setTimeout(() => {
        flowAudit.recordError('Subscription loading stuck > 10s');
      }, 10_000);
    } else {
      if (subStuckTimer.current) {
        clearTimeout(subStuckTimer.current);
        subStuckTimer.current = null;
      }
    }
    return () => {
      if (subStuckTimer.current) clearTimeout(subStuckTimer.current);
    };
  }, [subLoading]);

  // Admins bypass all gates
  if (isAdmin) {
    return {
      tier: "apex",
      isApex: true,
      isPlus: true,
      isPro: true,
      isLoading: false,
      canSendMessage: true,
      messagesRemaining: Infinity,
      canAccessFullPillars: true,
      canAccessCombat: true,
      canAccessHypnosis: true,
      canAccessNudges: true,
      canAccessArenaFull: true,
      canAccessBusinessBasic: true,
      canAccessPlanRecalibration: true,
      canAccessFullProactive: true,
      canAccessProjects: true,
      canAccessBusinessAdvanced: true,
      canAccessOrbDNA: true,
      canAccessCore: true,
      canAccessArena: true,
      maxHabits: Infinity,
      subscriptionEnd: null,
      showUpgradePrompt,
      upgradeFeature,
      dismissUpgrade,
      refetch: () => { refetch(); },
    };
  }

  const tier: SubscriptionTier = subData ? productIdToTier(subData.product_id) : "free";
  const isPlus = tierIncludes(tier, "plus");
  const isApex = tierIncludes(tier, "apex");

  flowAudit.subscription({ tier, isPro: isPlus, isLoading: subLoading, subscriptionEnd: subData?.end_date ?? null });
  const dailyCount = messageData ?? 0;
  const messagesRemaining = isPlus ? Infinity : Math.max(0, FREE_DAILY_MESSAGES - dailyCount);

  return {
    tier,
    isApex,
    isPlus,
    isPro: isApex, // legacy compat
    isLoading: subLoading,
    canSendMessage: isPlus || messagesRemaining > 0,
    messagesRemaining,
    // Plus+ gates (Self Optimization)
    canAccessFullPillars: isPlus,
    canAccessCombat: isPlus,
    canAccessHypnosis: isPlus,
    canAccessNudges: isPlus,
    canAccessArenaFull: isPlus,
    canAccessBusinessBasic: isPlus,
    canAccessPlanRecalibration: isPlus,
    // Apex gates (Self Mastery + Execution Power)
    canAccessFullProactive: isApex,
    canAccessProjects: isApex,
    canAccessBusinessAdvanced: isApex,
    canAccessOrbDNA: isApex,
    // Legacy compat
    canAccessCore: true,   // Core is open to all (assessment for Free, full for Plus+)
    canAccessArena: isPlus, // Arena full access is Plus+
    maxHabits: isPlus ? Infinity : FREE_MAX_HABITS,
    subscriptionEnd: subData?.end_date ?? null,
    showUpgradePrompt,
    upgradeFeature,
    dismissUpgrade,
    refetch: () => { refetch(); },
  };
};
