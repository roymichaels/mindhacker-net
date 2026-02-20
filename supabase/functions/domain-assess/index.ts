import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ───── Domain-specific configurations ───── */
interface DomainConfig {
  systemPrompt: string;
  subsystems: { id: string; description: string }[];
  startQuestion: { he: string; en: string };
}

const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  wealth: {
    startQuestion: {
      he: "ספר לי במשפט אחד — מה היחס שלך לכסף?",
      en: "Tell me in one sentence — what's your relationship with money?",
    },
    subsystems: [
      { id: "income_clarity", description: "0-100. Clarity on income sources and growth path" },
      { id: "financial_discipline", description: "0-100. Spending control, saving habits, budgeting" },
      { id: "value_creation", description: "0-100. Ability to create and deliver value others pay for" },
      { id: "opportunity_awareness", description: "0-100. Can they spot and act on opportunities?" },
      { id: "wealth_mindset", description: "0-100. Scarcity vs abundance thinking, money blocks" },
      { id: "strategic_positioning", description: "0-100. Career/business positioning for growth" },
    ],
    systemPrompt: `You are a wealth diagnostic engine in MindOS.
SHORT, SHARP conversation (6-10 messages) uncovering 6 subsystems:

1. Income Clarity (בהירות הכנסה) — Does the user have clear income sources & growth path?
2. Financial Discipline (משמעת פיננסית) — Spending control, saving, budgeting habits?
3. Value Creation (יצירת ערך) — Can they create value others pay for?
4. Opportunity Awareness (זיהוי הזדמנויות) — Do they spot and act on opportunities?
5. Wealth Mindset (חשיבה כלכלית) — Scarcity vs abundance? Money blocks?
6. Strategic Positioning (מיצוב אסטרטגי) — Are they positioned for financial growth?

RULES:
- ONE question at a time. Direct, personal, no financial jargon.
- Ask about REAL numbers when relevant — income, savings, debt. Don't be shy.
- Adapt — if someone reveals a money block, probe deeper.
- Use their language (Hebrew/English).
- After 6-10 exchanges, call extract_domain_profile.
- Keep messages SHORT. 1-3 sentences max.
- Challenge: "That sounds like an excuse" / "How long have you been telling yourself that?"
- Never give financial advice during assessment.

STYLE: Direct, no fluff, like a sharp business mentor who sees through excuses.`,
  },

  influence: {
    startQuestion: {
      he: "כשאתה נכנס לחדר — אנשים שמים לב?",
      en: "When you walk into a room — do people notice?",
    },
    subsystems: [
      { id: "communication_power", description: "0-100. Can they articulate ideas clearly and persuasively?" },
      { id: "presence_impact", description: "0-100. Do they command attention naturally?" },
      { id: "leadership_capacity", description: "0-100. Can they lead, delegate, inspire?" },
      { id: "social_intelligence", description: "0-100. Reading people, navigating dynamics" },
      { id: "persuasion_skill", description: "0-100. Can they negotiate, sell, convince?" },
      { id: "authenticity_in_power", description: "0-100. Are they influential while being real, or do they perform?" },
    ],
    systemPrompt: `You are an influence diagnostic engine in MindOS.
SHORT, SHARP conversation (6-10 messages) uncovering 6 subsystems:

1. Communication Power (כוח תקשורת) — Can they articulate ideas clearly and persuade?
2. Presence Impact (השפעת נוכחות) — Do they naturally command attention?
3. Leadership Capacity (יכולת מנהיגות) — Can they lead, delegate, inspire action?
4. Social Intelligence (אינטליגנציה חברתית) — Reading people, navigating group dynamics?
5. Persuasion Skill (כישורי שכנוע) — Negotiation, selling, convincing ability?
6. Authenticity in Power (אותנטיות בכוח) — Influential while being real, or performing a role?

RULES:
- ONE question at a time. Direct, provocative.
- Ask about REAL situations — last time they led, convinced someone, froze up.
- Probe contradictions — "You say you're a leader but you avoid conflict?"
- Use their language (Hebrew/English).
- After 6-10 exchanges, call extract_domain_profile.
- Keep messages SHORT. 1-3 sentences max.
- Challenge fake confidence. "That sounds rehearsed. What really happens?"
- Never give advice during assessment.

STYLE: Like a sharp mentor who sees through social masks and performances.`,
  },

  relationships: {
    startQuestion: {
      he: "מי האדם הכי קרוב אליך — ומתי דיברת איתו לאחרונה?",
      en: "Who's the closest person to you — and when did you last talk to them?",
    },
    subsystems: [
      { id: "connection_depth", description: "0-100. Quality of their closest relationships" },
      { id: "boundary_clarity", description: "0-100. Can they set and maintain healthy boundaries?" },
      { id: "vulnerability_access", description: "0-100. Can they be open and real with others?" },
      { id: "network_quality", description: "0-100. Quality and strategic value of their broader network" },
      { id: "conflict_capacity", description: "0-100. How they handle disagreement and tension" },
      { id: "reciprocity_balance", description: "0-100. Give vs take balance in relationships" },
    ],
    systemPrompt: `You are a relationships diagnostic engine in MindOS.
SHORT, SHARP conversation (6-10 messages) uncovering 6 subsystems:

1. Connection Depth (עומק קשרים) — Quality of their closest relationships?
2. Boundary Clarity (גבולות ברורים) — Can they set and maintain healthy limits?
3. Vulnerability Access (פתיחות) — Can they be real and open with others?
4. Network Quality (איכות רשת) — Strategic value and diversity of connections?
5. Conflict Capacity (התמודדות עם קונפליקט) — How do they handle disagreement?
6. Reciprocity Balance (איזון נתינה-קבלה) — Give vs take dynamic?

RULES:
- ONE question at a time. Direct, personal.
- Ask about REAL people, REAL situations — not abstract relationship philosophy.
- Probe patterns — "Is this the first time you've had this dynamic?"
- Use their language (Hebrew/English).
- After 6-10 exchanges, call extract_domain_profile.
- Keep messages SHORT. 1-3 sentences max.
- Challenge: "Sounds lonely. Is it?" / "When was the last time you asked for help?"
- Never give relationship advice during assessment.

STYLE: Like a sharp friend who asks the questions nobody dares to ask.`,
  },
};

/* ───── Build extraction tool dynamically ───── */
function buildExtractTool(domainId: string) {
  const config = DOMAIN_CONFIGS[domainId];
  if (!config) throw new Error(`Unknown domain: ${domainId}`);

  const subscoreProps: Record<string, any> = {};
  const requiredSubscores: string[] = [];
  const subsystemEnums: string[] = [];

  for (const sub of config.subsystems) {
    subscoreProps[sub.id] = { type: "number", description: sub.description };
    requiredSubscores.push(sub.id);
    subsystemEnums.push(sub.id);
  }

  return {
    type: "function",
    function: {
      name: "extract_domain_profile",
      description:
        "Extract the domain assessment results from the conversation. Call after 6-10 exchanges.",
      parameters: {
        type: "object",
        properties: {
          subscores: {
            type: "object",
            properties: subscoreProps,
            required: requiredSubscores,
          },
          findings: {
            type: "array",
            description: "3-6 key findings. Specific, not generic.",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Short snake_case id" },
                text_he: { type: "string", description: "Finding in Hebrew. Direct, everyday language." },
                text_en: { type: "string", description: "Finding in English. Direct language." },
                severity: { type: "string", enum: ["low", "med", "high"] },
                subsystem: { type: "string", enum: subsystemEnums },
              },
              required: ["id", "text_he", "text_en", "severity", "subsystem"],
            },
          },
          mirror_statement: {
            type: "object",
            description: "2-3 sentence 'mirror' reflecting who this person really is in this domain. Powerful, direct.",
            properties: { he: { type: "string" }, en: { type: "string" } },
            required: ["he", "en"],
          },
          one_next_step: {
            type: "object",
            description: "ONE concrete thing to do in the next 24 hours. Not a plan. Just one action.",
            properties: { he: { type: "string" }, en: { type: "string" } },
            required: ["he", "en"],
          },
          confidence: {
            type: "string",
            enum: ["low", "med", "high"],
            description: "How confident in this assessment based on conversation depth.",
          },
        },
        required: ["subscores", "findings", "mirror_statement", "one_next_step", "confidence"],
      },
    },
  };
}

/* ───── Handler ───── */
serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language, domainId } = await req.json();

    if (!domainId || !DOMAIN_CONFIGS[domainId]) {
      return new Response(
        JSON.stringify({ error: `Invalid domain: ${domainId}. Supported: ${Object.keys(DOMAIN_CONFIGS).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const config = DOMAIN_CONFIGS[domainId];
    const langLabel = language === "he" ? "Hebrew" : "English";
    const systemContent = `${config.systemPrompt}\n\nUser's preferred language: ${langLabel}. Always respond in that language.\n\nSTART with: "${language === "he" ? config.startQuestion.he : config.startQuestion.en}"`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemContent }, ...messages],
          tools: [buildExtractTool(domainId)],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("AI gateway error:", status, t);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("domain-assess error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
