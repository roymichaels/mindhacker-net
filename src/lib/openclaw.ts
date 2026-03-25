import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import YAML from 'yaml';

export interface AgentConfig {
  name: string;
  model: string;
  temperature?: number;
  max_output_tokens?: number;
  system_prompt: string;
  metadata?: Record<string, unknown>;
}

const agentCache = new Map<string, AgentConfig>();

export async function loadAgentConfig(agentName: string): Promise<AgentConfig> {
  const cached = agentCache.get(agentName);
  if (cached) return cached;

  const filePath = path.join(process.cwd(), 'openclaw-workspace', 'agents', `${agentName}.yaml`);
  const raw = await readFile(filePath, 'utf8');
  const parsed = YAML.parse(raw) as AgentConfig;

  if (!parsed?.name || !parsed?.model || !parsed?.system_prompt) {
    throw new Error(`Invalid agent config for ${agentName}`);
  }

  agentCache.set(agentName, parsed);
  return parsed;
}

export function interpolatePrompt(template: string, vars: Record<string, string | null | undefined>): string {
  return Object.entries(vars).reduce((acc, [key, value]) => {
    return acc.split(`{{${key}}}`).join(value ?? '');
  }, template);
}

export function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  });
}

export function resolveAgentModel(agentName: string, fallbackModel: string) {
  const envKey = `OPENROUTER_MODEL_${agentName.toUpperCase().replace(/-/g, '_')}`;
  return process.env[envKey] || fallbackModel;
}

export function buildSessionKey(parts: Array<string | null | undefined>) {
  const stable = parts.filter(Boolean).join(':') || 'anonymous';
  return createHash('sha1').update(stable).digest('hex');
}
