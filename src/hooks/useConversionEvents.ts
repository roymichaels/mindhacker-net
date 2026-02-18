import { useCallback } from 'react';
import { getStoredUTMData } from './useUTMTracker';

/**
 * Standard conversion events for Meta Pixel (fbq) and Google Ads (gtag).
 * Pixel scripts must be injected in index.html; this hook simply dispatches.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

type ConversionEvent =
  | 'PageView'
  | 'Lead'
  | 'CompleteRegistration'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Purchase';

export const useConversionEvents = () => {
  const fireEvent = useCallback((event: ConversionEvent, data?: Record<string, any>) => {
    const utm = getStoredUTMData();
    const payload = { ...data, ...utm };

    // Meta Pixel
    if (typeof window.fbq === 'function') {
      try {
        window.fbq('track', event, payload);
      } catch { /* silent */ }
    }

    // Google Ads / GA4
    if (typeof window.gtag === 'function') {
      try {
        const gtagEvent = event === 'CompleteRegistration' ? 'sign_up'
          : event === 'InitiateCheckout' ? 'begin_checkout'
          : event === 'Purchase' ? 'purchase'
          : event === 'Lead' ? 'generate_lead'
          : event === 'ViewContent' ? 'view_item'
          : event.toLowerCase();
        window.gtag('event', gtagEvent, payload);
      } catch { /* silent */ }
    }
  }, []);

  return {
    trackPageView: useCallback(() => fireEvent('PageView'), [fireEvent]),
    trackLead: useCallback((data?: Record<string, any>) => fireEvent('Lead', data), [fireEvent]),
    trackRegistration: useCallback((data?: Record<string, any>) => fireEvent('CompleteRegistration', data), [fireEvent]),
    trackViewContent: useCallback((data?: Record<string, any>) => fireEvent('ViewContent', data), [fireEvent]),
    trackInitiateCheckout: useCallback((data?: Record<string, any>) => fireEvent('InitiateCheckout', data), [fireEvent]),
    trackPurchase: useCallback((data?: Record<string, any>) => fireEvent('Purchase', data), [fireEvent]),
    fireEvent,
  };
};
