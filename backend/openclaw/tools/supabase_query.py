"""Supabase context helpers for the future OpenClaw service boundary.

This module mirrors the current TypeScript runtime in `src/lib/tools/supabaseQuery.ts`
so the OpenClaw service can move to Python tools without losing behavior.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional


def get_supabase_config() -> Dict[str, Optional[str]]:
    return {
        "url": os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL"),
        "anon_key": os.getenv("SUPABASE_ANON_KEY")
        or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
        or os.getenv("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY"),
        "service_role_key": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
    }


def execute_supabase_query(query: str, args: Dict[str, Any]) -> Dict[str, Any]:
    """Stub boundary for the Python OpenClaw service.

    The current production behavior is still implemented in TypeScript.
    This file documents and reserves the tool contract for the service migration.
    """

    if query == "aurora_context":
        return {
            "ok": False,
            "query": query,
            "error": "Python tool not wired yet. Use src/lib/tools/supabaseQuery.ts in the current runtime.",
            "args": args,
        }

    if query == "recent_messages":
        return {
            "ok": False,
            "query": query,
            "error": "Python tool not wired yet. Use src/lib/tools/supabaseQuery.ts in the current runtime.",
            "args": args,
        }

    return {"ok": False, "query": query, "error": f"Unsupported query: {query}"}
