# OpenClaw Workspace

This directory is the new home for agent-local memory, run logs, and temporary artifacts as the MindOS runtime moves out of Vercel edge-style handlers and into a dedicated OpenClaw service boundary.

Current state:
- Agent configs are live in `../agents/`
- Tool contracts are scaffolded in `../tools/`
- Production runtime still reads the TypeScript helpers in `src/lib/`

Next step:
- Move conversation memory and agent logs here once the standalone OpenClaw service is introduced
