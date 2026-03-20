import { bustOldCaches } from "./utils/cacheBuster";

// Clear old caches BEFORE rendering anything
bustOldCaches().then(() => {
  // Only render if we didn't reload (bustOldCaches reloads on first bust)
  import("react-dom/client").then(({ createRoot }) => {
    import("./App.tsx").then(({ default: App }) => {
      import("./index.css");
      createRoot(document.getElementById("root")!).render(<App />);
    });
  });
});
