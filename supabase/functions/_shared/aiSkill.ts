/**
 * Generic AI "skill" helper: a single tool-call returning typed JSON.
 *
 * Used by aion-orchestrator and other edge functions that want lightweight,
 * deterministic AI micro-calls (intent, emotion, journal, mode, artifact, memory, next).
 *
 * Defaults to NVIDIA Nemotron 3 Super free on OpenRouter — cheap enough for heavy use.
 * Falls back to Lovable AI Gateway if OPENROUTER_API_KEY is missing.
 */
import { aiChatCompletion } from "./aiGateway.ts";

export interface SkillSchema {
  /** Tool / function name returned by the model. */
  name: string;
  /** Human description of what the tool does. */
  description: string;
  /** JSON-schema for the tool arguments. */
  parameters: Record<string, unknown>;
}

export interface SkillCallOptions {
  system: string;
  user: string;
  schema: SkillSchema;
  /** Override model. Defaults to Nemotron-3-super-free on OpenRouter, gemini-flash-lite on Lovable. */
  model?: string;
  /** Lovable fallback model when OpenRouter isn't configured. */
  fallbackModel?: string;
  maxTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}

export interface SkillCallResult<T> {
  ok: boolean;
  result?: T;
  error?: string;
  duration_ms: number;
  model: string;
}

const DEFAULT_OR_MODEL = "nvidia/nemotron-nano-9b-v2:free";
const DEFAULT_LOVABLE_MODEL = "google/gemini-3.1-flash-lite-preview";

export async function callSkill<T = unknown>(
  opts: SkillCallOptions,
): Promise<SkillCallResult<T>> {
  const hasOpenRouter = !!Deno.env.get("OPENROUTER_API_KEY");
  const model =
    opts.model ?? (hasOpenRouter ? DEFAULT_OR_MODEL : (opts.fallbackModel ?? DEFAULT_LOVABLE_MODEL));
  const maxTokens = opts.maxTokens ?? 800;
  const timeoutMs = opts.timeoutMs ?? 8000;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = Date.now();

  try {
    const resp = await aiChatCompletion(
      {
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        temperature: opts.temperature ?? 0.4,
        max_tokens: maxTokens,
        tools: [{ type: "function", function: opts.schema }],
        tool_choice: { type: "function", function: { name: opts.schema.name } },
      },
      { signal: ctrl.signal },
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return {
        ok: false,
        error: `gateway_${resp.status}:${text.slice(0, 120)}`,
        duration_ms: Date.now() - start,
        model,
      };
    }

    const json = await resp.json();
    const tc = json.choices?.[0]?.message?.tool_calls?.[0];
    const args = tc?.function?.arguments;
    if (!args) {
      // Some models (incl. some free ones) ignore tool_choice and answer in content.
      const content = json.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        try {
          return {
            ok: true,
            result: JSON.parse(content) as T,
            duration_ms: Date.now() - start,
            model,
          };
        } catch (_) {
          /* fallthrough */
        }
      }
      return {
        ok: false,
        error: "no_tool_call",
        duration_ms: Date.now() - start,
        model,
      };
    }

    let parsed: T;
    try {
      parsed = typeof args === "string" ? JSON.parse(args) : args;
    } catch (e) {
      return {
        ok: false,
        error: `bad_json:${e instanceof Error ? e.message : "unknown"}`,
        duration_ms: Date.now() - start,
        model,
      };
    }

    return { ok: true, result: parsed, duration_ms: Date.now() - start, model };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return {
      ok: false,
      error: ctrl.signal.aborted ? "timeout" : msg,
      duration_ms: Date.now() - start,
      model,
    };
  } finally {
    clearTimeout(t);
  }
}