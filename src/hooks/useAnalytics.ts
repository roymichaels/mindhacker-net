import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  initSession,
  trackPageView,
  initScrollTracking,
  initVisibilityTracking,
  initUnloadTracking,
  trackEvent,
  trackFormView,
  trackFormStart,
  trackFormSubmit,
  trackCTAClick,
  trackDialogOpen,
  trackDialogClose,
  trackExitIntent,
  trackWhatsAppClick,
  trackSignupStart,
  trackSignupComplete,
  trackCheckoutStart,
  trackPurchaseComplete,
} from "@/lib/analytics";

// Hook to initialize analytics and track page views
export const useAnalytics = () => {
  const location = useLocation();
  const initialized = useRef(false);
  const analyticsEnabled = import.meta.env.VITE_ENABLE_APP_ANALYTICS === "true";

  // Initialize session on first load
  useEffect(() => {
    if (!analyticsEnabled) return;
    if (!initialized.current) {
      initSession();
      initialized.current = true;
    }
  }, [analyticsEnabled]);

  // Track page views on route change
  useEffect(() => {
    if (!analyticsEnabled) return;
    trackPageView(location.pathname);
  }, [analyticsEnabled, location.pathname]);

  // Set up scroll and visibility tracking
  useEffect(() => {
    if (!analyticsEnabled) return;
    const cleanupScroll = initScrollTracking();
    const cleanupVisibility = initVisibilityTracking();
    const cleanupUnload = initUnloadTracking();

    return () => {
      cleanupScroll();
      cleanupVisibility();
      cleanupUnload();
    };
  }, [analyticsEnabled]);
};

// Export individual tracking functions for use in components
export {
  trackEvent,
  trackFormView,
  trackFormStart,
  trackFormSubmit,
  trackCTAClick,
  trackDialogOpen,
  trackDialogClose,
  trackExitIntent,
  trackWhatsAppClick,
  trackSignupStart,
  trackSignupComplete,
  trackCheckoutStart,
  trackPurchaseComplete,
};
