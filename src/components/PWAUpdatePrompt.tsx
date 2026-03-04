/**
 * PWAUpdatePrompt — With autoUpdate, the new SW activates immediately.
 * This component periodically checks for updates and reloads if one is ready.
 */
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdatePrompt() {
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 15 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 15 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      // autoUpdate + skipWaiting handles activation; just reload
      window.location.reload();
    },
  });

  return null;
}
