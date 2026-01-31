/// <reference types="vite-plugin-pwa/client" />
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Service worker registration handled by vite-plugin-pwa
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        showUpdateToast();
      },
      onOfflineReady() {
        console.log('App ready for offline use');
      },
    });
  }).catch(() => {
    // PWA registration failed silently
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
      background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05));
      border: 1px solid hsl(var(--primary) / 0.3);
      backdrop-filter: blur(10px);
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      direction: rtl;
      font-family: inherit;
      box-shadow: 0 10px 40px hsl(var(--primary) / 0.2);
      animation: slideUp 0.3s ease-out;
    `;
    
    toastContainer.innerHTML = `
      <style>
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        #pwa-update-toast button:hover {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
      </style>
      <span style="color: hsl(var(--foreground)); font-size: 14px;">🔄 גרסה חדשה זמינה</span>
      <button id="pwa-update-btn" style="
        background: hsl(var(--primary) / 0.2);
        border: 1px solid hsl(var(--primary) / 0.5);
        color: hsl(var(--primary));
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
