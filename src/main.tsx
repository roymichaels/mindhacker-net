import { bustOldCaches } from "./utils/cacheBuster";

function renderApp() {
  import("react-dom/client").then(({ createRoot }) => {
    import("./App.tsx").then(({ default: App }) => {
      import("./index.css");
      createRoot(document.getElementById("root")!).render(<App />);
    });
  });
}

// Fail-safe: never block app render forever if cache APIs hang.
Promise.race<boolean>([
  bustOldCaches(),
  new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
])
  .then((reloading) => {
    if (!reloading) renderApp();
  })
  .catch(() => {
    renderApp();
  });
