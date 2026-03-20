import { bustOldCaches } from "./utils/cacheBuster";

// Clear old caches BEFORE rendering anything
bustOldCaches().then((reloading) => {
  // If a reload was triggered, don't render — the page is about to refresh
  if (reloading) return;

  import("react-dom/client").then(({ createRoot }) => {
    import("./App.tsx").then(({ default: App }) => {
      import("./index.css");
      createRoot(document.getElementById("root")!).render(<App />);
    });
  });
});
