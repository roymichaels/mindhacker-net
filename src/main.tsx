import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Defer service worker registration until after page load for better LCP
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/custom-sw.js');
      
      // Check for updates periodically (every 60 seconds)
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
      
      // Listen for new service worker waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available - show toast notification
              showUpdateToast();
            }
          });
        }
      });
    } catch {
      // SW registration failed silently in production
    }
  });
  
  // Listen for controller change (when new SW takes over)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

function showUpdateToast() {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('pwa-update-toast');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'pwa-update-toast';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, hsl(180 100% 50% / 0.15), hsl(180 100% 50% / 0.05));
      border: 1px solid hsl(180 100% 50% / 0.3);
      backdrop-filter: blur(10px);
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      direction: rtl;
      font-family: inherit;
      box-shadow: 0 10px 40px rgba(0, 240, 255, 0.2);
      animation: slideUp 0.3s ease-out;
    `;
    
    toastContainer.innerHTML = `
      <style>
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        #pwa-update-toast button:hover {
          background: hsl(180 100% 50%) !important;
          color: hsl(240 10% 4%) !important;
        }
      </style>
      <span style="color: hsl(0 0% 98%); font-size: 14px;">🔄 גרסה חדשה זמינה</span>
      <button id="pwa-update-btn" style="
        background: hsl(180 100% 50% / 0.2);
        border: 1px solid hsl(180 100% 50% / 0.5);
        color: hsl(180 100% 50%);
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      ">רענן עכשיו</button>
    `;
    
    document.body.appendChild(toastContainer);
    
    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      // Tell the waiting SW to skip waiting
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    });
  }
}
