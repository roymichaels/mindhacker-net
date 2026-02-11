import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debug } from '@/lib/debug';

// pushManager is part of the Push API but not always in TS ServiceWorkerRegistration type
type PushServiceWorkerRegistration = ServiceWorkerRegistration & {
  pushManager: PushManager;
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getDeviceType = (): 'ios' | 'android' | 'desktop' | 'other' => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows|Mac|Linux/.test(ua) && !/Mobile/.test(ua)) return 'desktop';
  return 'other';
};

const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) {
    const match = ua.match(/Android.*?;([^;)]+)/);
    return match ? match[1].trim() : 'Android Device';
  }
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows PC';
  return 'Unknown Device';
};

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);

      // Check if running as PWA
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsPWA(standalone);

      // Get current permission
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Fetch VAPID key from edge function
  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('push-notifications', {
          body: { action: 'get-vapid-key' }
        });
        
        if (error) throw error;
        if (data?.vapidKey) {
          setVapidKey(data.vapidKey);
        }
      } catch (error) {
        debug.warn('Failed to fetch VAPID key:', error);
      }
    };

    fetchVapidKey();
  }, []);

  // Check if already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) return;

      try {
        const registration = await navigator.serviceWorker.ready as PushServiceWorkerRegistration;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Verify subscription exists in database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint)
            .eq('is_active', true)
            .single();
          
          setIsSubscribed(!!data);
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        debug.warn('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [isSupported, user]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      debug.warn('Push notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      debug.error('Error requesting permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    debug.log('[Push] Starting subscribe process...');
    debug.log('[Push] isSupported:', isSupported, 'user:', !!user, 'vapidKey:', !!vapidKey);
    
    if (!isSupported || !user || !vapidKey) {
      debug.warn('[Push] Cannot subscribe: missing requirements');
      return false;
    }

    setIsLoading(true);

    try {
      // iOS Safari requires ALWAYS calling requestPermission in gesture context
      // Even if already granted - this refreshes the gesture association
      debug.log('[Push] Requesting permission (iOS fix: always request)...');
      const permissionResult = await Notification.requestPermission();
      debug.log('[Push] Permission result:', permissionResult);
      
      if (permissionResult !== 'granted') {
        debug.warn('[Push] Permission not granted');
        setIsLoading(false);
        return false;
      }
      setPermission(permissionResult);

      // Get service worker registration
      debug.log('[Push] Getting service worker registration...');
      const registration = await navigator.serviceWorker.ready;
      debug.log('[Push] Service worker ready, active state:', registration.active?.state);
      
      // Wait for service worker to be fully activated (iOS fix)
      if (registration.active && registration.active.state !== 'activated') {
        debug.log('[Push] Waiting for service worker to activate...');
        await new Promise<void>((resolve) => {
          if (registration.active?.state === 'activated') {
            resolve();
          } else {
            const handleStateChange = () => {
              if (registration.active?.state === 'activated') {
                registration.active?.removeEventListener('statechange', handleStateChange);
                resolve();
              }
            };
            registration.active?.addEventListener('statechange', handleStateChange);
            // Timeout fallback
            setTimeout(() => {
              debug.log('[Push] SW activation timeout, proceeding anyway');
              resolve();
            }, 2000);
          }
        });
        debug.log('[Push] Service worker now activated');
      }

      // Subscribe to push - pass Uint8Array directly for iOS compatibility
      const keyArray = urlBase64ToUint8Array(vapidKey);
      debug.log('[Push] Attempting pushManager.subscribe with keyArray length:', keyArray.length);
      
      const subscription = await (registration as PushServiceWorkerRegistration).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray as BufferSource
      });
      
      debug.log('[Push] Subscription created successfully!');
      debug.log('[Push] Endpoint:', subscription.endpoint.substring(0, 50) + '...');

      const subscriptionJson = subscription.toJSON();
      
      if (!subscriptionJson.endpoint || !subscriptionJson.keys) {
        throw new Error('Invalid subscription - missing endpoint or keys');
      }

      // Save subscription to edge function
      debug.log('[Push] Saving subscription to server...');
      const { error } = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'subscribe',
          subscription: {
            endpoint: subscriptionJson.endpoint,
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth,
            device_type: getDeviceType(),
            device_name: getDeviceName()
          }
        }
      });

      if (error) {
        debug.error('[Push] Server save error:', error);
        throw error;
      }

      setIsSubscribed(true);
      debug.log('[Push] ✅ Push subscription complete and saved!');
      return true;
    } catch (error) {
      debug.error('[Push] ❌ Push subscription failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, vapidKey]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready as PushServiceWorkerRegistration;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from database via edge function
        await supabase.functions.invoke('push-notifications', {
          body: {
            action: 'unsubscribe',
            endpoint: subscription.endpoint
          }
        });
      }

      setIsSubscribed(false);
      debug.log('Push unsubscription successful');
      return true;
    } catch (error) {
      debug.error('Push unsubscription failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  return {
    permission,
    isSubscribed,
    isSupported,
    isPWA,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe
  };
};
