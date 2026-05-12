/**
 * Unified AI gateway helper.
 * Prefers OpenRouter (faster, user's own key) when OPENROUTER_API_KEY is set.
 * Falls back to Lovable AI Gateway otherwise.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Map Lovable model ids to OpenRouter equivalents.
const MODEL_MAP: Record<string, string> = {
  "google/gemini-3-flash-preview": "google/gemini-2.5-flash",
  "google/gemini-3.1-flash-lite-preview": "google/gemini-2.5-flash-lite",
  "google/gemini-3.1-pro-preview": "google/gemini-2.5-pro",
  "google/gemini-3-pro-image-preview": "google/gemini-2.5-flash-image",
  "google/gemini-3.1-flash-image-preview": "google/gemini-2.5-flash-image",
  "openai/gpt-5": "openai/gpt-4o",
  "openai/gpt-5-mini": "openai/gpt-4o-mini",
  "openai/gpt-5-nano": "openai/gpt-4o-mini",
  "openai/gpt-5.2": "openai/gpt-4o",
  "openai/gpt-5.4": "openai/gpt-4o",
  "openai/gpt-5.4-mini": "openai/gpt-4o-mini",
  "openai/gpt-5.4-nano": "openai/gpt-4o-mini",
  "openai/gpt-5.4-pro": "openai/gpt-4o",
  "openai/gpt-5.5": "openai/gpt-4o",
  "openai/gpt-5.5-pro": "openai/gpt-4o",
};

export function resolveModel(model: string, provider: "openrouter" | "lovable"): string {
  if (provider === "openrouter") return MODEL_MAP[model] ?? model;
  return model;
}

// Models that only exist on OpenRouter — never remap to Lovable.
export function isOpenRouterOnly(model: string): boolean {
  return model.includes(":free") || model.startsWith("nvidia/") || model.startsWith("meta-llama/") || model.startsWith("mistralai/");
}

export function getProvider(): "openrouter" | "lovable" {
  return Deno.env.get("OPENROUTER_API_KEY") ? "openrouter" : "lovable";
}

export interface AIRequestBody {
  model: string;
  messages: any[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  tools?: any[];
  tool_choice?: any;
  response_format?: any;
  reasoning?: any;
  [k: string]: any;
}

export async function aiChatCompletion(
  body: AIRequestBody,
  init?: { signal?: AbortSignal }
): Promise<Response> {
  const provider = getProvider();
  const url = provider === "openrouter" ? OPENROUTER_URL : LOVABLE_URL;
  const apiKey =
    provider === "openrouter"
      ? Deno.env.get("OPENROUTER_API_KEY")!
      : Deno.env.get("LOVABLE_API_KEY")!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://mind-hacker.net";
    headers["X-Title"] = "Mind OS";
  }

  const payload = { ...body, model: resolveModel(body.model, provider) };

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: init?.signal,
  });
}