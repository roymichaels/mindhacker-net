import { bustOldCaches } from "./utils/cacheBuster";

// One-time cleanup of stale Web3Auth tokens that cause "missing sub claim" errors
try {
  ["openlogin_store", "Web3Auth-cachedAdapter"].forEach((k) => localStorage.removeItem(k));
} catch {}

function renderApp() {
  import("react-dom/client").then(({ createRoot }) => {
    import("./App.tsx").then(({ default: App }) => {
      import("./index.css");
      createRoot(document.getElementById("root")!).render(<App />);
    });
  });
}

const bootstrapReset = (globalThis as typeof globalThis & {
  __MINDOS_BOOTSTRAP__?: Promise<unknown>;
}).__MINDOS_BOOTSTRAP__;

// Fail-safe: never block app render forever if cache APIs hang.
Promise.resolve(bootstrapReset)
  .catch(() => undefined)
  .then(() =>
    Promise.race<boolean>([
      bustOldCaches(),
      new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
    ])
  )
  .then((reloading) => {
    if (!reloading) renderApp();
  })
  .catch(() => {
    renderApp();
  });
