/**
 * aurora-capture-journal
 *
 * Takes a chat excerpt (recent assistant + user messages) and extracts a
 * structured journal entry using Lovable AI, then persists it to
 * `journal_entries` with source='aion'.
 *
 * Returns the created entry plus the AI-detected category so the client can
 * confirm or undo.
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_CATEGORIES = [
  'gratitude','plan','beliefs','dream','reflection',
  'breakthrough','emotion','lesson','win',
] as const;

const SYSTEM_PROMPT = `You are AION's journaling layer. Read the conversation excerpt and decide if it contains meaningful self-reflection worth saving as a journal entry. If yes, extract a structured entry. If not, return should_save=false.

Categories (pick the single best fit):
- gratitude: thanks, appreciation, recognition of good
- plan: stated intention, next action, commitment
- beliefs: identity statements, mindset shifts, reframes
- dream: actual dreams or future visions
- reflection: general self-observation
- breakthrough: insight, unlocking, realization
- emotion: emotional state, mood, feelings
- lesson: something learned, will/won't repeat
- win: accomplishment, victory, completed milestone

Write the title, summary, ai_insight in the SAME language as the user's text (Hebrew or English). Keep title under 60 chars, summary under 240 chars.`;

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResp({ error: 'Method not allowed' }, 405);

  try {
    if (!LOVABLE_API_KEY) return jsonResp({ error: 'LOVABLE_API_KEY not configured' }, 500);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResp({ error: 'Missing authorization' }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return jsonResp({ error: 'Unauthorized' }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const excerpt: string = String(body?.excerpt || '').slice(0, 6000).trim();
    const linkedMissionId: string | undefined = body?.linked_mission_id ?? undefined;
    const forceSave: boolean = !!body?.force_save;
    if (!excerpt) return jsonResp({ error: 'excerpt required' }, 400);

    // AI extraction via tool calling
    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: excerpt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'save_journal_entry',
            description: 'Persist a structured journal entry derived from the conversation.',
            parameters: {
              type: 'object',
              properties: {
                should_save: { type: 'boolean' },
                category: { type: 'string', enum: [...ALLOWED_CATEGORIES] },
                title: { type: 'string' },
                summary: { type: 'string' },
                ai_insight: { type: 'string' },
                mood: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['should_save'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'save_journal_entry' } },
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error('AI gateway error', aiResp.status, text);
      if (aiResp.status === 429) return jsonResp({ error: 'Rate limited' }, 429);
      if (aiResp.status === 402) return jsonResp({ error: 'Credits exhausted' }, 402);
      return jsonResp({ error: 'AI extraction failed' }, 500);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments || '{}') : {};

    if (!args?.should_save && !forceSave) {
      return jsonResp({ saved: false, reason: 'not_meaningful' });
    }
    // When force-saving (manual journal capture), fall back to 'reflection'
    // if the model didn't classify confidently. Never let manual entries fail silently.
    if (!ALLOWED_CATEGORIES.includes(args.category)) {
      if (forceSave) {
        args.category = 'reflection';
      } else {
        return jsonResp({ saved: false, reason: 'invalid_category' });
      }
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await admin
      .from('journal_entries')
      .insert({
        user_id: userId,
        journal_type: args.category,
        content: args.summary || excerpt.slice(0, 500),
        title: args.title ?? null,
        summary: args.summary ?? null,
        source_excerpt: excerpt.slice(0, 2000),
        ai_insight: args.ai_insight ?? null,
        mood: args.mood ?? null,
        tags: Array.isArray(args.tags) ? args.tags.slice(0, 8) : null,
        source: 'aion',
        linked_mission_id: linkedMissionId ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('insert error', error);
      return jsonResp({ error: 'Failed to save entry' }, 500);
    }

    return jsonResp({ saved: true, entry: data, category: args.category });
  } catch (e) {
    console.error('aurora-capture-journal error', e);
    return jsonResp({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});