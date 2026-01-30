
# Plan: Complete Logo Update Across All Locations

## Summary
The new logo (blue-gold sphere) was copied to the icon files, but several components and the database still reference non-versioned paths, causing browsers to show cached old icons. Additionally, the PWA manifest needs version cache-busting.

## Technical Details

### Files to Update

1. **src/components/LanguagePrompt.tsx**
   - Line 6: Change `"/icons/icon-96x96.png"` to `"/icons/icon-96x96.png?v=4"`

2. **src/pages/AdminLogin.tsx**  
   - Line 12: Change `"/icons/icon-96x96.png"` to `"/icons/icon-96x96.png?v=4"`

3. **src/pages/MessageThread.tsx**
   - Line 53: Change `"/icons/icon-96x96.png"` to `"/icons/icon-96x96.png?v=4"`

4. **public/custom-sw.js** (Service Worker)
   - Line 92: Change `'/icons/icon-192x192.png'` to `'/icons/icon-192x192.png?v=4'`
   - Line 93: Change `'/icons/icon-96x96.png'` to `'/icons/icon-96x96.png?v=4'`

5. **supabase/functions/push-notifications/index.ts**
   - Update icon references to include version parameter

6. **vite.config.ts** (PWA Manifest)
   - Add version query parameter to all icon paths in the manifest config

7. **Database Update**
   - Update `theme_settings` table entries for `logo_url` and `favicon_url` to include `?v=4`

### Implementation Steps

1. Update all component files with cache-busting version parameter
2. Update service worker icon references
3. Update PWA manifest icon paths in vite.config.ts
4. Update database entries via SQL migration
5. After deployment, users should hard-refresh (Ctrl+Shift+R) or reinstall PWA

### Expected Result
All locations showing the old power-button logo will display the new blue-gold sphere logo after refresh.
