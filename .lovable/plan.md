
# Avatar Configurator — Integration Status

## ✅ Completed

### Infrastructure
- `@react-spring/three@9.6.1` installed
- GLB models copied to `public/models/` (Armature, Poses, Teleporter Base)
- Asset GLBs copied to `public/models/assets/` (Bottom.001-003, Armature)
- Thumbnail copied to `public/models/thumbnails/`

### Database
- `avatar_customizations` table created with RLS (user can CRUD own row only)
- Fields: `id`, `user_id` (unique), `customization_data` (jsonb), timestamps

### Components (src/components/avatar/)
- `avatarAssets.ts` — Static asset config replacing PocketBase (8 categories: Head, Hair, Face, Eyes, Top, Bottom, Shoes, Accessory)
- `avatarStore.ts` — Zustand store with serialize/deserialize for DB persistence
- `Asset.tsx` — Skinned mesh with color/skin material (exact port)
- `AvatarModel.tsx` — Armature + pose animations (GLB export removed)
- `LoadingAvatar.tsx` — Orange cylinder animation (exact port)
- `CameraManager.tsx` — Camera controls (leva debug removed)
- `Experience.tsx` — 3D scene with lights/shadows (screenshot/branding removed)
- `AvatarConfiguratorUI.tsx` — Poses bar, category tabs, color picker, asset grid, randomize button (Photo Booth tab removed, Save button added)
- `AvatarConfigurator.tsx` — Canvas + postprocessing (Leva removed)
- `AvatarRequiredModal.tsx` — Mandatory full-screen modal for uncustomized users

### Routing
- `/avatar` route added (protected, full-screen, no AppShell)
- `AvatarRequiredModal` mounted globally for all authenticated users

## ⏳ Waiting for Assets

The configurator currently only has **Bottom** category populated (3 GLBs).
Need user to upload remaining GLBs + thumbnails for:
- Head, Hair, Face, Eyes, Top, Shoes, Accessory

Once uploaded, add them to `src/components/avatar/avatarAssets.ts`.
