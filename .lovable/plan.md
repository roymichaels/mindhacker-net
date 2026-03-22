

## Avatar Configurator Integration Plan

### What we have
All source files are now available:
- **Store** (`store.js`): Zustand store with PocketBase for asset fetching, poses, customization, randomize, locked groups
- **UI** (`UI.jsx`): Poses bar, asset selector with thumbnails, color picker, randomize/screenshot/download buttons, "Customize avatar" / "Photo booth" tabs
- **Experience** (`Experience.jsx`): 3D scene with lights, shadows, environment, avatar wrapper with spring animations
- **Avatar** (`Avatar.jsx`): Armature + skinned mesh rendering with GLB export
- **Asset** (`Asset.jsx`): Individual skinned mesh with color/skin material support
- **CameraManager** (`CameraManager.jsx`): Camera controls with category-based placement
- **LoadingAvatar** (`LoadingAvatar.jsx`): Orange cylinder loading animation
- **App** (`App.jsx`): Canvas + postprocessing + UI overlay

GLB models uploaded: `Armature.glb`, `Poses.glb`, `Teleporter Base.glb`, plus asset GLBs (`Bottom.001.glb`, etc.)

### Key challenges
1. **PocketBase → local data**: The store fetches categories/assets from PocketBase. We need to replace this with a local static config + storage bucket for asset GLBs and thumbnails
2. **Missing dependencies**: `@react-spring/three@9.6.1`, `leva` (used only for debug, will remove)
3. **GLB export dependencies** (`@gltf-transform/*`, `three-stdlib`): Only needed for download — will skip for now
4. **Asset thumbnails**: Source uses `pb.files.getUrl()` — need to serve from storage bucket or public folder
5. **You said you'll send assets 10 at a time** — we need all the category GLBs and their thumbnails to populate the configurator

### Plan

#### 1. Wait for all asset uploads
You mentioned sending assets 10 at a time. I need:
- All category asset GLBs (like `Bottom.001.glb`, `Bottom.002.glb`, etc. for each category: Head, Hair, Face, Eyes, etc.)
- Thumbnail images for each asset (the small preview images shown in the selector grid)

#### 2. Copy GLB models to `public/models/`
- `Armature.glb`, `Poses.glb`, `Teleporter Base.glb` → `public/models/`
- All category asset GLBs → `public/models/assets/` (organized by category or flat)
- All thumbnails → `public/models/thumbnails/`

#### 3. Install missing dependency
- `@react-spring/three@9.6.1`
- Skip `leva` (remove debug controls from CameraManager)
- Skip `@gltf-transform/*` and `three-stdlib` (remove download/export feature)

#### 4. Create static asset configuration
Replace PocketBase with a hardcoded config file `src/components/avatar/avatarAssets.ts`:
```text
categories = [
  { name: "Head", removable: false, startingAsset: "...", colorPalette: [...], assets: [...] },
  { name: "Hair", removable: true, assets: [...] },
  ...
]
```
Each asset entry: `{ id, name, url (GLB path), thumbnail (image path), lockedGroups }`

#### 5. Port components (exact copies, minimal changes)
- `src/components/avatar/store.ts` — Zustand store, replace PocketBase fetch with static data import
- `src/components/avatar/Asset.tsx` — exact copy
- `src/components/avatar/AvatarModel.tsx` — from Avatar.jsx, remove GLB export logic
- `src/components/avatar/CameraManager.tsx` — remove leva debug, keep camera logic
- `src/components/avatar/LoadingAvatar.tsx` — exact copy
- `src/components/avatar/Experience.tsx` — exact copy
- `src/components/avatar/AvatarConfiguratorUI.tsx` — from UI.jsx, remove Photo Booth tab/mode, remove screenshot/download buttons, remove wawasensei branding
- `src/components/avatar/AvatarConfigurator.tsx` — from App.jsx, Canvas + postprocessing + UI

#### 6. Create `/avatar` route
- `src/pages/AvatarConfigurator.tsx` — renders the full configurator
- Add route in `App.tsx` inside protected routes

#### 7. Database: avatar_customizations table
```sql
CREATE TABLE public.avatar_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customization_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: users manage own row only
```

#### 8. Mandatory avatar modal
- `src/components/avatar/AvatarRequiredModal.tsx` — full-screen Dialog that cannot be closed
- On mount: query `avatar_customizations` for current user
- If no row exists → show modal with the full configurator embedded
- Admin users (checked via `has_role`) can dismiss
- "Save Avatar" button saves to DB and closes modal
- Mount in `App.tsx` for all authenticated users

#### 9. Add CSS for noscrollbar
Add `.noscrollbar` utility class to existing styles.

### What I need from you next
**Send all the remaining asset GLBs and their thumbnail images** (the small preview pics shown in the category selector). Once I have those + know the full category structure (which assets belong to which category, colors, starting defaults), I'll implement everything.

