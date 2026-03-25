"""Domain assessment extraction contract for the future OpenClaw service.

The live implementation remains in `src/lib/tools/extractDomainProfile.ts`.
"""

from __future__ import annotations

from typing import Any, Dict


def build_extract_domain_profile_tool(domain_id: str) -> Dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": "extract_domain_profile",
            "description": f"Extract the final domain assessment for {domain_id}.",
            "parameters": {
                "type": "object",
                "properties": {
                    "subscores": {"type": "object"},
                    "findings": {"type": "array"},
                    "mirror_statement": {"type": "object"},
                    "one_next_step": {"type": "object"},
                    "willingness": {"type": "object"},
                    "domain_metrics": {"type": "object"},
                    "confidence": {"type": "string"},
                },
                "required": [
                    "subscores",
                    "findings",
                    "mirror_statement",
                    "one_next_step",
                    "willingness",
                    "domain_metrics",
                    "confidence",
                ],
            },
        },
    }
