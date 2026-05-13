/**
 * Phase 3 — AION artifact sentinel parser.
 *
 * Server (composer LLM) may embed one or more artifact specs inside the
 * streamed reply using a reserved sentinel:
 *
 *   <<AION_ARTIFACT { "kind": "next_action", "title": "…", … }>>
 *
 * The sentinel survives `sanitizeStream` because it doesn't match any
 * `<think>`/preamble pattern. This parser extracts all such blocks from
 * a finished assistant message and returns the cleaned visible text.
 *
 * Pure function. Safe on any string.
 */
import type { ArtifactKind } from '@/components/aion/artifacts/artifactBus';

export interface ParsedArtifact {
  kind: ArtifactKind;
  title: string;
  body?: string;
  cta?: { label: string; href?: string; capability?: string; params?: Record<string, unknown> };
  ttl?: number;
  /** Set when kind === 'confirm' — the capability that runs on accept. */
  confirm?: { capability: string; params?: Record<string, unknown>; label?: string };
}

const SENTINEL_RE = /<<\s*AION_ARTIFACT\s*([\s\S]*?)>>/g;

const VALID_KINDS: ArtifactKind[] = [
  'next_action',
  'journal_capture',
  'plan_summary',
  'note',
  'insight',
  'capability',
  'confirm',
];

export interface ParseResult {
  cleanText: string;
  artifacts: ParsedArtifact[];
}

export function parseArtifactSentinels(text: string): ParseResult {
  if (!text || text.indexOf('<<AION_ARTIFACT') === -1) {
    return { cleanText: text, artifacts: [] };
  }

  const artifacts: ParsedArtifact[] = [];
  const cleanText = text.replace(SENTINEL_RE, (_match, payload: string) => {
    try {
      const obj = JSON.parse(payload.trim());
      if (!obj || typeof obj !== 'object') return '';
      if (!VALID_KINDS.includes(obj.kind)) return '';
      if (typeof obj.title !== 'string' || !obj.title.trim()) return '';
      artifacts.push(obj as ParsedArtifact);
    } catch {
      // Malformed sentinel — drop silently.
    }
    return '';
  });

  return { cleanText: cleanText.replace(/\s{3,}/g, '\n\n').trim(), artifacts };
}