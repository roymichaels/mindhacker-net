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

  // Initialize session on first load
  useEffect(() => {
    if (!initialized.current) {
      initSession();
      initialized.current = true;
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Set up scroll and visibility tracking
  useEffect(() => {
    const cleanupScroll = initScrollTracking();
    const cleanupVisibility = initVisibilityTracking();
    const cleanupUnload = initUnloadTracking();

    return () => {
      cleanupScroll();
      cleanupVisibility();
      cleanupUnload();
    };
  }, []);
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
