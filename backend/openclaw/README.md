# OpenClaw Backend

`backend/openclaw` is the target service boundary for the MindOS engine.

Contents:
- `agents/`: Aurora and assessment agent definitions
- `tools/`: service-side tool contracts for Supabase and domain extraction
- `workspace/`: future memory, logs, and transient artifacts

The current production runtime still streams through Vercel API handlers in `/api`, but those handlers now have a canonical backend home to migrate toward.
