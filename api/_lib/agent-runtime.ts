import { buildSessionKey, createOpenRouterClient, interpolatePrompt, loadAgentConfig, resolveAgentModel } from '../../src/lib/openclaw.js';
import { buildAuroraContextSummary, authenticateBearerToken } from '../../src/lib/tools/supabaseQuery.js';
import { buildDomainAssessSystemPrompt, buildExtractDomainProfileTool } from '../../src/lib/tools/extractDomainProfile.js';
import { initSse, writeContentFallback, writeDone, writeSse } from './sse.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
};

function sanitizeMessages(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => {
      if (message.role === 'user') {
        return {
          role: 'user',
          content: message.content,
        } as ChatCompletionMessageParam;
      }

      return {
        role: 'assistant',
        content: typeof message.content === 'string' ? message.content : '',
      } as ChatCompletionMessageParam;
    });
}

function parseBody(body: unknown) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

export async function streamAuroraAgent(req: any, res: any) {
  const body = parseBody(req.body);
  const agentConfig = await loadAgentConfig('aurora-chat');
  const auth = await authenticateBearerToken(req.headers.authorization);
  const userId = auth.userId || body.userId || null;
  const language = body.language === 'he' ? 'he' : 'en';
  const timezone = typeof body.timezone === 'string' ? body.timezone : null;
  const pillar = typeof body.pillar === 'string' ? body.pillar : '';
  const sessionKey = body.sessionKey || buildSessionKey(['aurora-chat', userId, body.conversationId]);
  const contextSummary = await buildAuroraContextSummary({ userId, language, timezone });

  const client = createOpenRouterClient();
  const systemPrompt = interpolatePrompt(agentConfig.system_prompt, {
    language,
    language_label: language === 'he' ? 'Hebrew' : 'English',
    pillar,
    timezone: timezone || 'UTC',
    session_key: sessionKey,
    context_summary: contextSummary,
  });

  initSse(res);

  try {
    const stream = await client.chat.completions.create({
      model: resolveAgentModel('aurora-chat', agentConfig.model),
      temperature: agentConfig.temperature ?? 0.7,
      max_tokens: agentConfig.max_output_tokens ?? 900,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...sanitizeMessages(body.messages || [])],
    });

    for await (const chunk of stream) {
      writeSse(res, chunk);
    }

    writeDone(res);
  } catch (error) {
    console.error('[aurora-chat] agent error', error);
    const fallback =
      language === 'he'
        ? 'יש כרגע תקלה זמנית בחיבור. תמשיך מהנקודה האחרונה במשפט אחד, ואני אמשיך איתך ברגע שהחיבור יתייצב.'
        : 'There is a temporary connection issue right now. Continue from the last point in one sentence and I will pick it up as soon as the connection stabilizes.';
    writeContentFallback(res, fallback);
  }
}

export async function streamDomainAssessAgent(req: any, res: any) {
  const body = parseBody(req.body);
  const agentConfig = await loadAgentConfig('domain-assess');
  const language = body.language === 'he' ? 'he' : 'en';
  const domainId = typeof body.domainId === 'string' ? body.domainId : '';
  const sessionKey = body.sessionKey || buildSessionKey(['domain-assess', body.userId, domainId, body.conversationId]);
  const systemPrompt = `${buildDomainAssessSystemPrompt(domainId, language)}\n\n${interpolatePrompt(agentConfig.system_prompt, {
    language,
    language_label: language === 'he' ? 'Hebrew' : 'English',
    domain_id: domainId,
    session_key: sessionKey,
  })}`;

  initSse(res);

  try {
    const client = createOpenRouterClient();
    const stream = await client.chat.completions.create({
      model: resolveAgentModel('domain-assess', agentConfig.model),
      temperature: agentConfig.temperature ?? 0.3,
      max_tokens: agentConfig.max_output_tokens ?? 1200,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...sanitizeMessages(body.messages || [])],
      tools: [buildExtractDomainProfileTool(domainId)],
      tool_choice: 'auto',
    });

    for await (const chunk of stream) {
      writeSse(res, chunk);
    }

    writeDone(res);
  } catch (error) {
    console.error('[domain-assess] agent error', error);
    const fallback =
      language === 'he'
        ? 'יש כרגע תקלה זמנית. תענה במשפט קצר על המצב שלך בתחום הזה, ואני אמשיך מיד כשיהיה יציב.'
        : 'There is a temporary issue right now. Reply with one short sentence about your current state in this domain, and I will continue as soon as the connection is stable.';
    writeContentFallback(res, fallback);
  }
}
