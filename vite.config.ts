import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "public",
      filename: "custom-sw.js",
      registerType: "autoUpdate",
      injectRegister: false, // Disable auto-inject to defer SW registration
      includeAssets: ["icons/*", "robots.txt", "sitemap.xml"],
      manifest: {
        name: "מיינד האקר - אימון תודעתי עמוק",
        short_name: "מיינד האקר",
        description: "אימון תודעתי עמוק עם דין אזולאי - שחרר דפוסים מגבילים וצור שינוי אמיתי",
        theme_color: "#00f0ff",
        background_color: "#0a0a0f",
        display: "standalone",
        orientation: "portrait",
        dir: "rtl",
        lang: "he",
        start_url: "/",
        scope: "/",
        categories: ["health", "lifestyle", "education"],
        icons: [
          {
            src: "/logo.png?v=6",
            sizes: "72x72",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "96x96",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "128x128",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "152x152",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "384x384",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/logo.png?v=6",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}));
