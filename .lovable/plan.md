

# Fix PWA Icon Disappearing When Saving to Home Screen

## Problem

iOS (and some Android browsers) don't support SVG for home screen icons. The current setup points `apple-touch-icon` and the PWA manifest exclusively to `/aurora-icon.svg`. The icon flashes briefly (from the page screenshot) then disappears when the OS tries to process the SVG and fails.

PNG icon files already exist in `public/` but aren't referenced:
- `apple-touch-icon.png`
- `pwa-192x192.png`
- `pwa-512x512.png`
- `icon-192x192.png`
- `icon-512x512.png`

## Changes

### 1. `index.html` — Point apple-touch-icon to PNG

Replace all four `apple-touch-icon` lines (48-51) to reference the existing PNG file instead of SVG:

```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon.png" />
```

### 2. `vite.config.ts` — Add PNG icons to PWA manifest

Update the manifest `icons` array to include the existing PNG files alongside the SVG:

```js
icons: [
  {
    src: "/pwa-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any"
  },
  {
    src: "/pwa-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any"
  },
  {
    src: "/pwa-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable"
  },
  {
    src: "/aurora-icon.svg",
    sizes: "any",
    type: "image/svg+xml",
    purpose: "any"
  }
]
```

### Why This Fixes It

- iOS requires PNG for `apple-touch-icon` — SVG is silently ignored, causing the icon to vanish
- The PWA install prompt on both iOS and Android picks the best icon from the manifest; PNG entries ensure a compatible format is always available
- The SVG is kept as a fallback for browsers that do support it

