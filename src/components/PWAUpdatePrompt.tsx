/**
 * PWAUpdatePrompt — Shows a toast when a new version is available.
 * User decides when to reload, preventing mid-flow interruptions.
 */
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export function PWAUpdatePrompt() {
  const toastShown = useRef(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (needRefresh && !toastShown.current) {
      toastShown.current = true;
      toast('גרסה חדשה זמינה', {
        description: 'לחץ לעדכון',
        action: {
          label: 'עדכן עכשיו',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
        dismissible: true,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
