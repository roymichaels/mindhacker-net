import { useState, useEffect, useCallback } from "react";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const STORAGE_KEYS = {
  lastDismissed: "promo_last_dismissed",
  sessionCount: "promo_session_count",
};

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_INTERVAL = 3; // show every 3rd session

export const usePromoPopup = () => {
  const { tier } = useSubscriptionGate();
  const [showPromo, setShowPromo] = useState(false);

  const isFree = tier === "free";

  const isInCooldown = useCallback(() => {
    const last = localStorage.getItem(STORAGE_KEYS.lastDismissed);
    if (!last) return false;
    return Date.now() - Number(last) < COOLDOWN_MS;
  }, []);

  // Session-based trigger on mount
  useEffect(() => {
    if (!isFree || isInCooldown()) return;

    const count = Number(localStorage.getItem(STORAGE_KEYS.sessionCount) || "0") + 1;
    localStorage.setItem(STORAGE_KEYS.sessionCount, String(count));

    if (count % SESSION_INTERVAL === 1) {
      // slight delay so the page renders first
      const t = setTimeout(() => setShowPromo(true), 2000);
      return () => clearTimeout(t);
    }
  }, [isFree]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissPromo = useCallback(() => {
    setShowPromo(false);
    localStorage.setItem(STORAGE_KEYS.lastDismissed, String(Date.now()));
  }, []);

  const triggerPromo = useCallback(() => {
    if (!isFree || isInCooldown()) return;
    setShowPromo(true);
  }, [isFree, isInCooldown]);

  return { shouldShowPromo: showPromo, dismissPromo, triggerPromo };
};
