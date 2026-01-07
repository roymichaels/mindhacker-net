import { supabase } from "@/integrations/supabase/client";

// Session storage keys
const SESSION_KEY = "mh_session_id";
const VISITOR_KEY = "mh_visitor_id";
const PAGE_VIEW_KEY = "mh_current_page_view";

// Generate unique IDs
const generateId = () => crypto.randomUUID();

// Get or create session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Get or create visitor ID (persistent across sessions)
export const getVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = generateId();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
};

// Check if returning visitor
export const isReturningVisitor = (): boolean => {
  return localStorage.getItem(VISITOR_KEY) !== null;
};

// Extract UTM parameters from URL
export const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  };
};

// Detect device type
export const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

// Detect browser
export const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
};

// Detect OS
export const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "MacOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
};

// Get screen size category
export const getScreenSize = (): string => {
  const width = window.innerWidth;
  if (width < 640) return "xs";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  if (width < 1280) return "lg";
  return "xl";
};

// Initialize or update visitor session
export const initSession = async (): Promise<void> => {
  const sessionId = getSessionId();
  const isReturning = isReturningVisitor();
  const utmParams = getUtmParams();

  // Get visitor ID to mark as returning for next visit
  getVisitorId();

  try {
    // Try to update existing session
    const { data: existing } = await supabase
      .from("visitor_sessions")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (existing) {
      // Update last seen
      await supabase
        .from("visitor_sessions")
        .update({ last_seen: new Date().toISOString() })
        .eq("session_id", sessionId);
    } else {
      // Create new session
      await supabase.from("visitor_sessions").insert({
        session_id: sessionId,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        screen_size: getScreenSize(),
        language: navigator.language,
        referrer: document.referrer || undefined,
        landing_page: window.location.pathname,
        is_returning: isReturning,
        ...utmParams,
      });
    }
  } catch (error) {
    console.debug("Analytics: Failed to init session", error);
  }
};

// Store current page view ID for updates
let currentPageViewId: string | null = null;
let pageEnterTime: number = Date.now();
let maxScrollDepth: number = 0;

// Track page view
export const trackPageView = async (path: string, title?: string): Promise<void> => {
  const sessionId = getSessionId();
  const referrerPath = sessionStorage.getItem(PAGE_VIEW_KEY) || undefined;
  
  // Reset tracking for new page
  pageEnterTime = Date.now();
  maxScrollDepth = 0;

  try {
    const { data } = await supabase
      .from("page_views")
      .insert({
        session_id: sessionId,
        page_path: path,
        page_title: title || document.title,
        referrer_path: referrerPath,
      })
      .select("id")
      .single();

    if (data) {
      currentPageViewId = data.id;
      sessionStorage.setItem(PAGE_VIEW_KEY, path);
    }

    // Update session last seen
    await supabase
      .from("visitor_sessions")
      .update({ last_seen: new Date().toISOString() })
      .eq("session_id", sessionId);
  } catch (error) {
    console.debug("Analytics: Failed to track page view", error);
  }
};

// Track scroll depth
export const trackScrollDepth = (percent: number): void => {
  if (percent > maxScrollDepth) {
    maxScrollDepth = percent;
  }
};

// Update page view with exit data (called on page leave)
export const updatePageExit = async (): Promise<void> => {
  if (!currentPageViewId) return;

  const timeOnPage = Math.floor((Date.now() - pageEnterTime) / 1000);

  try {
    await supabase
      .from("page_views")
      .update({
        exited_at: new Date().toISOString(),
        time_on_page_seconds: timeOnPage,
        scroll_depth_percent: maxScrollDepth,
        is_bounce: maxScrollDepth < 25 && timeOnPage < 10,
      })
      .eq("id", currentPageViewId);
  } catch (error) {
    console.debug("Analytics: Failed to update page exit", error);
  }
};

// Track conversion event
export const trackEvent = async (
  eventType: string,
  category?: string,
  source?: string,
  data?: Record<string, unknown>,
  value?: number
): Promise<void> => {
  const sessionId = getSessionId();

  try {
    await (supabase.from("conversion_events") as any).insert({
      session_id: sessionId,
      event_type: eventType,
      event_category: category,
      source: source,
      page_path: window.location.pathname,
      event_data: data || {},
      conversion_value: value,
    });
  } catch (error) {
    console.debug("Analytics: Failed to track event", error);
  }
};

// Convenience methods for common events
export const trackFormView = (source: string) => 
  trackEvent("form_view", "lead_capture", source);

export const trackFormStart = (source: string) => 
  trackEvent("form_start", "lead_capture", source);

export const trackFormSubmit = (source: string, success: boolean, data?: Record<string, unknown>) =>
  trackEvent(success ? "form_success" : "form_error", "lead_capture", source, data);

export const trackCTAClick = (source: string, destination?: string) =>
  trackEvent("cta_click", "engagement", source, { destination });

export const trackDialogOpen = (dialogName: string) =>
  trackEvent("dialog_open", "engagement", dialogName);

export const trackDialogClose = (dialogName: string) =>
  trackEvent("dialog_close", "engagement", dialogName);

export const trackExitIntent = () =>
  trackEvent("exit_intent", "engagement", "exit_popup");

export const trackWhatsAppClick = () =>
  trackEvent("whatsapp_click", "engagement", "whatsapp_button");

export const trackSignupStart = () =>
  trackEvent("signup_start", "auth");

export const trackSignupComplete = () =>
  trackEvent("signup_complete", "auth");

export const trackCheckoutStart = (productType: string, value?: number) =>
  trackEvent("checkout_start", "purchase", productType, undefined, value);

export const trackPurchaseComplete = (productType: string, value: number) =>
  trackEvent("purchase_complete", "purchase", productType, undefined, value);

// Initialize scroll tracking
export const initScrollTracking = (): (() => void) => {
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
    trackScrollDepth(scrollPercent);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
};

// Handle page visibility change for more accurate time tracking
export const initVisibilityTracking = (): (() => void) => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      updatePageExit();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
};

// Handle beforeunload for session end
export const initUnloadTracking = (): (() => void) => {
  const handleUnload = () => {
    updatePageExit();
  };

  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
};
