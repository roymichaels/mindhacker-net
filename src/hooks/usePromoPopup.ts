import { useState, useEffect, useCallback } from "react";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";

const STORAGE_KEYS = {
  lastDismissed: "promo_last_dismissed",
  sessionCount: "promo_session_count",
  accountCreatedAt: "promo_account_created",
};

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_INTERVAL = 3; // show every 3rd session
const NEW_USER_SESSION_INTERVAL = 2; // every 2nd session for first week
const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FIRST_SESSION_DELAY_MS = 60_000; // 60 seconds

export const usePromoPopup = () => {
  const { tier } = useSubscriptionGate();
  const [showPromo, setShowPromo] = useState(false);

  const isFree = tier === "free";

  const isInCooldown = useCallback(() => {
    const last = localStorage.getItem(STORAGE_KEYS.lastDismissed);
    if (!last) return false;
    return Date.now() - Number(last) < COOLDOWN_MS;
  }, []);

  const isNewUser = useCallback(() => {
    const created = localStorage.getItem(STORAGE_KEYS.accountCreatedAt);
    if (!created) {
      // First time seeing this key — set it now
      localStorage.setItem(STORAGE_KEYS.accountCreatedAt, String(Date.now()));
      return true;
    }
    return Date.now() - Number(created) < NEW_USER_WINDOW_MS;
  }, []);

  // Session-based trigger on mount
  useEffect(() => {
    if (!isFree || isInCooldown()) return;

    const count = Number(localStorage.getItem(STORAGE_KEYS.sessionCount) || "0") + 1;
    localStorage.setItem(STORAGE_KEYS.sessionCount, String(count));

    const interval = isNewUser() ? NEW_USER_SESSION_INTERVAL : SESSION_INTERVAL;

    if (count % interval === 1) {
      const t = setTimeout(() => setShowPromo(true), 2000);
      return () => clearTimeout(t);
    }
  }, [isFree]); // eslint-disable-line react-hooks/exhaustive-deps

  // First-session-after-onboarding trigger
  useEffect(() => {
    if (!isFree || isInCooldown()) return;

    // Check if onboarding was just completed (launchpad_complete flag set recently)
    const justOnboarded = sessionStorage.getItem('just_completed_onboarding');
    if (justOnboarded) {
      sessionStorage.removeItem('just_completed_onboarding');
      const t = setTimeout(() => {
        if (!isInCooldown()) setShowPromo(true);
      }, FIRST_SESSION_DELAY_MS);
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
