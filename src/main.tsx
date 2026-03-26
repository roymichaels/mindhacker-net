// Browser polyfills required by Web3Auth SDK — must run before any imports
import { Buffer } from 'buffer';
import process from 'process';

if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}
if (typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}
if (
  typeof (globalThis as any).process === 'undefined' ||
  typeof (globalThis as any).process?.nextTick !== 'function'
) {
  (globalThis as any).process = process;
}

import { bustOldCaches } from "./utils/cacheBuster";

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
