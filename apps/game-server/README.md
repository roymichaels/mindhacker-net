# Game Server

`apps/game-server` is the first real-time MMO slice for Evolve.

Current scope:
- Colyseus `HubRoom`
- Supabase JWT auth in `onAuth`
- Player join/leave/session persistence
- Movement sync and position persistence
- Stub NPC interaction and quest claim hooks for OpenClaw integration

Run locally:

```powershell
npm run dev --workspace @evolve/game-server
```

Required env vars:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` optional, defaults to `4000`
- `CORS_ORIGIN` optional, defaults to `*`
