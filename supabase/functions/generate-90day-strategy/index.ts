import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { validateHubReadiness } from "../_shared/assessment-quality.ts";

const CORE_PILLAR_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
const ARENA_PILLAR_IDS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order'];

const TOTAL_PHASES = 10;
const TOTAL_DAYS = 100;
const DAYS_PER_PHASE = TOTAL_DAYS / TOTAL_PHASES;
const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface PillarAssessment {
  domain_id: string;
  domain_config: Record<string, any>;
  status: string;
}

// ========== ASSESSMENT FIELD RESOLVER ==========
function resolveAssessmentBlock(assessment: PillarAssessment | undefined): string {
  if (!assessment) return 'No assessment data — generate goals based on general best practices for this pillar.';
  
  const cfg = assessment.domain_config || {};
  const latest = cfg.latest_assessment;
  if (!latest) return 'No assessment data — generate goals based on general best practices for this pillar.';
  
  const formData = cfg.form_data || cfg.onboarding_data || {};
  const overallScore = latest.overall_index ?? latest.domain_index ?? latest.consciousness_index ?? latest.overallScore ?? null;
  const mirrorStatement = latest.mirror_statement || latest.mirrorStatement || '';
  const nextStep = latest.one_next_step || latest.nextStep || '';
  const subscores = latest.subscores || latest.subsystems || latest.subScores || {};
  const findings = latest.findings?.slice(0, 5) || [];

  const rawInputs = latest.rawInputsUsed || {};
  const historyInputs = cfg.history?.[0]?.rawInputsUsed || {};
  const allRawInputs = { ...historyInputs, ...rawInputs };
  const rawInputsSummary = Object.keys(allRawInputs).length > 0
    ? `\nRaw Inputs: ${JSON.stringify(allRawInputs, null, 1).slice(0, 600)}`
    : '';

  return `Score: ${overallScore ?? '?'}/100
Mirror Statement: ${mirrorStatement || 'N/A'}
Subscores: ${JSON.stringify(subscores, null, 1)}
Findings: ${JSON.stringify(findings, null, 1)}
Next Step: ${nextStep || 'N/A'}
Assessed At: ${latest.assessed_at || 'Unknown'}
Form Data: ${JSON.stringify(formData, null, 1).slice(0, 500)}${rawInputsSummary}`;
}

// ========== CONSTRAINTS BLOCK ==========
function buildStrategyConstraintsBlock(allDomains: PillarAssessment[]): string {
  const parts: string[] = [];

  const vitalityDomain = allDomains.find(d => d.domain_id === 'vitality');
  const vLatest = vitalityDomain?.domain_config?.latest_assessment;
  const rawInputs = vLatest?.rawInputsUsed || {};
  const historyInputs = vitalityDomain?.domain_config?.history?.[0]?.rawInputsUsed || {};
  const bio = { ...historyInputs, ...rawInputs };

  const dietType = Array.isArray(bio.diet_type) ? bio.diet_type : (bio.diet_type ? [bio.diet_type] : []);
  if (dietType.length > 0) {
    const label = dietType.join(' + ').toUpperCase();
    const isVegan = dietType.some((d: string) => ['vegan', 'alkaline'].includes(d.toLowerCase()));
    const forbidden: string[] = [];
    if (isVegan) {
      forbidden.push('dairy (cheese, yogurt, butter, milk, whey, feta)', 'eggs', 'meat', 'fish', 'seafood', 'honey', 'gelatin', 'any animal products');
    } else if (dietType.some((d: string) => d.toLowerCase() === 'vegetarian')) {
      forbidden.push('meat', 'fish', 'seafood');
    }
    if (dietType.some((d: string) => d.toLowerCase() === 'alkaline')) {
      forbidden.push('refined sugar', 'white flour', 'processed foods', 'soda');
    }
    parts.push(`- DIET: ${label} — NEVER include: ${forbidden.join(', ')}`);
  }

  if (bio.alcohol_frequency === 'never') parts.push('- NO ALCOHOL — never suggest alcohol-related activities');
  if (bio.nicotine === 'no' || bio.nicotine === 'never') parts.push('- NO NICOTINE');

  if (bio.sleep_time || bio.wake_time || bio.desired_wake_time) {
    parts.push(`- SLEEP: ${bio.sleep_time || '?'} → ${bio.wake_time || bio.desired_wake_time || '?'}`);
  }

  const notWilling: string[] = [];
  for (const domain of allDomains) {
    const w = domain.domain_config?.latest_assessment?.willingness;
    if (w?.not_willing && Array.isArray(w.not_willing) && w.not_willing.length > 0) {
      notWilling.push(...w.not_willing.map((nw: string) => `${nw} (${domain.domain_id})`));
    }
  }
  if (notWilling.length > 0) {
    parts.push(`- USER REFUSES: ${notWilling.join(', ')}`);
  }

  if (parts.length === 0) return '';
  return `\n## CRITICAL USER CONSTRAINTS (NEVER VIOLATE):\n${parts.join('\n')}\n\nEvery goal, milestone, and daily action MUST respect these constraints.\n`;
}

// ========== USER CONTEXT ==========
function buildUserContext(
  profileData: any,
  userProjects: any[],
  userBusinesses: any[],
  auroraMemory: any[],
  hobbies?: string[],
): string {
  const projectsSection = userProjects
    .map(p => `- "${p.name}" (${p.status}) — ${p.description || ''} | Pillar: ${p.life_pillar || 'general'} | Goals: ${JSON.stringify(p.goals || []).slice(0, 200)}`)
    .join('\n') || 'None';

  const businessSection = userBusinesses.length > 0
    ? userBusinesses.map(b => {
        const vision = b.step_1_vision ? JSON.stringify(b.step_1_vision).slice(0, 300) : '';
        const model = b.step_2_business_model ? JSON.stringify(b.step_2_business_model).slice(0, 300) : '';
        const marketing = b.step_8_marketing ? JSON.stringify(b.step_8_marketing).slice(0, 200) : '';
        return `- "${b.business_name || 'Unnamed'}" (step ${b.current_step}/10, ${b.journey_complete ? 'complete' : 'in progress'})
  Vision: ${vision || 'N/A'}
  Model: ${model || 'N/A'}
  Marketing: ${marketing || 'N/A'}`;
      }).join('\n')
    : 'None';

  const memorySnippets = auroraMemory.slice(0, 25)
    .map(m => `- [${m.created_at?.slice(0, 10) || '?'}] [${m.emotional_state || 'neutral'}] ${m.summary}`)
    .join('\n') || 'None';

  const hobbiesSection = hobbies && hobbies.length > 0
    ? `\n## HOBBIES & PLAY PREFERENCES (from onboarding)\n${hobbies.join(', ')}\n\nCRITICAL: For the "play" pillar, milestones MUST be based on these actual hobbies and interests.\nDo NOT generate generic "smile protocols" or abstract play tasks.\nGenerate milestones like: "Weekly hiking trip", "Join a local basketball game", "Plan a camping weekend", "30min photography walk", etc.\n`
    : '';

  return `## USER
Name: ${profileData?.name || 'Unknown'}
Intention: ${JSON.stringify(profileData?.intention || '')}
Today: ${new Date().toISOString().split('T')[0]}

## PROJECTS (with goals and pillar mapping)
${projectsSection}

## BUSINESSES (with journey data)
${businessSection}
${hobbiesSection}
## USER MEMORY (25 most recent, timeline-aware)
${memorySnippets}`;
}

// Pillar scope definitions
const PILLAR_SCOPES: Record<string, { scope_en: string; NOT_en: string }> = {
  consciousness: { scope_en: 'Self-awareness, ego states, shadow work, emotional intelligence, mindfulness, inner dialogue, psychological patterns, self-understanding', NOT_en: 'NOT meditation techniques (→focus), NOT physical health (→vitality), NOT breathing exercises (→focus)' },
  presence: { scope_en: 'Social confidence, charisma, public speaking, body language, first impressions, voice projection, stage presence, personal magnetism', NOT_en: 'NOT physical strength (→power), NOT fighting skills (→combat), NOT networking strategy (→influence)' },
  power: { scope_en: 'Physical strength, max lifts (squat/bench/deadlift), bodyweight strength, calisthenics progressions (muscle-up/planche/handstand), explosive power, grip strength, structural strength', NOT_en: 'NOT sleep optimization (→vitality), NOT cardio/endurance (→vitality), NOT flexibility/yoga (→focus), NOT fighting/martial arts (→combat), NOT nutrition (→vitality)' },
  vitality: { scope_en: 'Energy management, sleep optimization, nutrition, hydration, cardiovascular health, hormonal health, recovery, cold/heat exposure, circadian rhythm, longevity protocols, GROUNDING/EARTHING, sun exposure, lymphatic activation, structured hydration protocols', NOT_en: 'NOT strength training (→power), NOT fighting (→combat), NOT meditation (→focus)' },
  focus: { scope_en: 'Breath work, meditation, guided meditation, hypnosis/trance, somatic awareness (tai chi/qigong), structural calm (yoga), attention training, CO2 tolerance, nervous system regulation', NOT_en: 'NOT physical strength (→power), NOT sleep/nutrition (→vitality), NOT social skills (→presence), NOT productivity systems (→order)' },
  combat: { scope_en: 'Martial arts training, boxing, Muay Thai, kickboxing, shadowboxing, heavy bag work, sparring, fighting technique, combat conditioning, self-defense', NOT_en: 'NOT general strength (→power), NOT flexibility (→focus), NOT cardio (→vitality)' },
  expansion: { scope_en: 'Learning new skills, intellectual growth, reading, courses, creative pursuits, exploring new domains, curiosity, knowledge acquisition, personal development', NOT_en: 'NOT business learning (→business), NOT financial education (→wealth), NOT social skills (→presence/influence)' },
  wealth: { scope_en: 'Financial planning, investing, savings, budgeting, income growth, passive income, financial literacy, asset building, debt management, financial freedom strategy', NOT_en: 'NOT business operations (→business), NOT selling/marketing (→influence), NOT project management (→projects)' },
  influence: { scope_en: 'Networking, personal branding, social media presence, content creation, thought leadership, persuasion, sales, marketing, community building, reputation management', NOT_en: 'NOT social confidence (→presence), NOT financial planning (→wealth), NOT business operations (→business)' },
  relationships: { scope_en: 'Romantic relationships, family bonds, friendships, communication skills, conflict resolution, intimacy, boundaries, dating, social connection, emotional support systems', NOT_en: 'NOT networking/branding (→influence), NOT charisma (→presence), NOT self-awareness (→consciousness)' },
  business: { scope_en: 'Business strategy, operations, product development, team management, scaling, business model, customer acquisition, systems, processes, entrepreneurship', NOT_en: 'NOT personal finance (→wealth), NOT personal branding (→influence), NOT project execution (→projects)' },
  projects: { scope_en: 'Project planning, execution, milestones, deliverables, time management for specific projects, MVP development, shipping, iteration, portfolio management', NOT_en: 'NOT business strategy (→business), NOT financial planning (→wealth), NOT general productivity (→order)' },
  play: { scope_en: 'Recreation based on USER\'S ACTUAL HOBBIES (see hobbies section above), outdoor adventures (hiking, camping, cycling, surfing), travel planning, team sports for fun, creative play, board games, social events, entertainment, joy, work-life balance. MUST use the user\'s selected hobbies to generate concrete activity-based milestones like "Weekly hiking trip" or "Join pickup basketball" — NEVER abstract protocols.', NOT_en: 'NOT competitive training (→combat/power), NOT skill building (→expansion), NOT social networking (→influence), NOT abstract "smile protocols" or "positive communication" — those belong to relationships/social' },
  order: { scope_en: 'Daily routines, habits, organization, environment design, productivity systems, time blocking, decluttering, discipline, accountability, life admin', NOT_en: 'NOT project-specific tasks (→projects), NOT business processes (→business), NOT meditation/focus practices (→focus)' },
};

// Pillar icon map
const PILLAR_ICON_MAP: Record<string, string> = {
  consciousness: '🧠', presence: '👁️', power: '💪', vitality: '🌿',
  focus: '🎯', combat: '🥊', expansion: '🚀', wealth: '💰',
  influence: '🌐', relationships: '❤️', business: '📈',
  projects: '🏗️', play: '🎮', order: '📋',
};

const PILLAR_CATEGORY_MAP: Record<string, string> = {
  consciousness: 'spirit', presence: 'social', power: 'body', vitality: 'body',
  focus: 'mind', combat: 'body', expansion: 'mind', wealth: 'wealth',
  influence: 'social', relationships: 'social', business: 'wealth',
  projects: 'wealth', play: 'spirit', order: 'mind',
};

// ========== TRAIT GENERATION PROMPT ==========
function buildTraitPrompt(
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
  constraintsBlock: string,
  traitCount: number,
): string {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  const scope = PILLAR_SCOPES[pillarId];
  const scopeBlock = scope
    ? `\n## PILLAR SCOPE:\nIN SCOPE: ${scope.scope_en}\n${scope.NOT_en}\n`
    : '';

  const traitArrayItems = Array.from({ length: traitCount }, (_, i) =>
    i === 0
      ? `    { "name_en": "Trait Name", "name_he": "שם התכונה", "description_en": "One sentence", "description_he": "משפט אחד", "icon": "emoji" }`
      : `    { "name_en": "...", "name_he": "...", "description_en": "...", "description_he": "...", "icon": "..." }`
  ).join(',\n');

  return `You are Aurora, elite life transformation AI for "Mind OS".

TASK: Generate exactly ${traitCount} CHARACTER TRAIT${traitCount > 1 ? 'S' : ''} (abilities) for the pillar "${pillarId}" (${hub} hub).

Traits are identity-based capabilities that the user will develop over 100 days.
They are NOT tasks, NOT protocols, NOT educational topics.
They represent who the user is BECOMING.

${userContext}
${constraintsBlock}
## PILLAR "${pillarId.toUpperCase()}" ASSESSMENT
${assessmentBlock}
${scopeBlock}

## TRAIT NAMING RULES (CRITICAL):
- Each trait MUST be 2-3 words maximum
- Traits describe IDENTITY CAPABILITIES, not activities
- Use power words that feel like RPG character abilities
- Hebrew must be natural and compelling (2-3 words)

GOOD trait examples:
- Strategic Mind / תודעה אסטרטגית
- Wealth Architect / אדריכל העושר
- Magnetic Presence / נוכחות מגנטית
- Inner Commander / המפקד הפנימי
- Tactical Awareness / מודעות טקטית
- Creative Engine / מנוע יצירתי
- Energy Discipline / משמעת אנרגטית
- Relentless Builder / בנאי בלתי נלאה
- Shadow Master / אדון הצללים
- Iron Will / רצון ברזל

BAD trait examples (NEVER generate these):
- Financial Literacy (too educational)
- Time Management (too generic)
- Budget Tracking (too task-like)
- Task Organization (boring)
- Self Awareness (too vague)
- Healthy Eating (too basic)
- הרחבת וחיזוק רשת הקשרים (too long, mission-like)
- יצירת ערך לא ברורה (assessment finding, not trait)
- שיעור חיסכון משוער (diagnosis, not identity)

Traits should feel like unlocking character evolution abilities in a life RPG.
They must be personalized to the user's assessment data and context.

## OUTPUT (JSON only, NO markdown):
{
  "traits": [
${traitArrayItems}
  ]
}`;
}

// LAYER 1: Generate 3 missions for a SINGLE TRAIT
function buildMissionsForTraitPrompt(
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
  constraintsBlock: string,
  traitName: { name_en: string; name_he: string },
  traitDescription: string,
): string {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  const scope = PILLAR_SCOPES[pillarId];
  const scopeBlock = scope
    ? `\n## PILLAR SCOPE (STRICT BOUNDARIES):\nIN SCOPE: ${scope.scope_en}\n${scope.NOT_en}\n`
    : '';
  
  return `You are Aurora, elite life transformation AI for "Mind OS" (מיינד OS).

TASK: Generate exactly 3 MISSIONS for the character trait "${traitName.name_en}" / "${traitName.name_he}" in pillar "${pillarId}" (${hub} hub).
Each mission is a progressive training arc that develops this specific trait.
This is part of a 100-DAY TRANSFORMATION PLAN.

## CHARACTER TRAIT:
"${traitName.name_en}" / "${traitName.name_he}"
${traitDescription}

${userContext}
${constraintsBlock}
## PILLAR "${pillarId.toUpperCase()}" ASSESSMENT
${assessmentBlock}
${scopeBlock}
## TREATMENT-ONLY RULES (CRITICAL):
- BANNED VERBS: "identify", "assess", "check", "evaluate", "test", "measure", "track", "recognize", "notice", "become aware", "journal about feelings", "reflect on"
- REQUIRED VERBS: "practice", "execute", "perform", "drill", "complete", "run protocol", "train", "apply"
- EVERY mission must be something the user DOES physically/actively

## TITLE FORMAT RULES (CRITICAL):
- Each mission title (goal_en/goal_he) MUST be a SHORT label: 2-6 words maximum.
- Titles describe a distinct training arc, NOT a paragraph or instruction.
- Titles must semantically belong to the trait "${traitName.name_en}" — do NOT reference other trait names.
- Hebrew titles must be natural and concise (2-6 words), NOT translated English.

## ABSOLUTE PROHIBITION — NUMBERED CLONE TITLES:
- NEVER generate titles like "[trait name] 1", "[trait name] 2", "[trait name] 3"
- NEVER prefix with "אימון" + trait name + number. This is BANNED.
- NEVER repeat the trait name across all 3 missions with only a number suffix.
- Each mission title MUST be UNIQUE and describe a DIFFERENT developmental angle.

## MISSION ARC STRUCTURE:
- Mission 1 = FOUNDATION arc: grounding, basics, establishing the trait's core patterns
- Mission 2 = APPLICATION arc: expressing, applying, expanding the trait in real situations  
- Mission 3 = MASTERY arc: integrating the trait into identity, lifestyle, long-term habits

## EXAMPLES OF GOOD vs BAD:
If trait = "Sculpted Form" / "צורה מפוסלת":
  BAD: "אימון צורה מפוסלת 1", "אימון צורה מפוסלת 2", "אימון צורה מפוסלת 3"
  GOOD: "יסודות חיטוב ותבנית גוף", "כוח פונקציונלי וקו תנועה", "משמעת אסתטית והתמדה גופנית"

If trait = "Magnetic Posture" / "יציבה מגנטית":
  BAD: "אימון יציבה מגנטית 1", "אימון יציבה מגנטית 2", "אימון יציבה מגנטית 3"
  GOOD: "יסודות יציבה ונוכחות", "ביטחון גופני בתנועה", "שקט סמכותי והבעה פיזית"

If trait = "Network Weaver" / "אורג הרשת":
  BAD: "אימון אורג הרשת 1", "אימון אורג הרשת 2", "אימון אורג הרשת 3"
  GOOD: "בניית נוכחות דיגיטלית", "יצירת קשרים אסטרטגיים", "מנהיגות מחשבתית ברשת"

## RULES:
1. Missions MUST directly address assessment findings with TREATMENT PROTOCOLS.
2. Reference user's actual projects/businesses BY NAME where relevant.
3. Hebrew must be natural, not translated.
4. All 3 missions must be SEMANTICALLY DISTINCT — different angles of the same trait.
5. CRITICAL: Every mission MUST fall within the pillar's IN SCOPE definition.
6. CRITICAL: Every mission MUST respect the user's CRITICAL CONSTRAINTS.
7. Each mission describes a specific TRAINING ARC for the trait "${traitName.name_en}".
8. If you generate numbered clones, the system will REJECT your output.

## OUTPUT (JSON only, NO markdown):
{
  "goals": [
    { "goal_en": "Short 2-6 word title", "goal_he": "כותרת קצרה 2-6 מילים" },
    { "goal_en": "Short 2-6 word title", "goal_he": "כותרת קצרה 2-6 מילים" },
    { "goal_en": "Short 2-6 word title", "goal_he": "כותרת קצרה 2-6 מילים" }
  ]
}`;
}

// LAYER 2: Generate 5 milestones for each of 3 missions
function buildMilestonesPrompt(
  pillarId: string,
  goals: { goal_en: string; goal_he: string }[],
  assessmentBlock: string,
  constraintsBlock: string,
): string {
  const goalsStr = goals.map((g, i) => `  ${i+1}. "${g.goal_en}" / "${g.goal_he}"`).join('\n');
  const scope = PILLAR_SCOPES[pillarId];
  const scopeBlock = scope
    ? `\n## PILLAR SCOPE (STRICT):\nIN SCOPE: ${scope.scope_en}\n${scope.NOT_en}\n`
    : '';
  
  return `You are Aurora for "Mind OS". TASK: Break down each mission into exactly 5 STRATEGIC PROTOCOLS.
This is part of a 100-DAY TRANSFORMATION PLAN. Each mission has 5 high-level strategic commitments.

## PILLAR: ${pillarId.toUpperCase()}
${scopeBlock}${constraintsBlock}
## MISSIONS:
${goalsStr}

## ASSESSMENT CONTEXT:
${assessmentBlock}

## WHAT ARE STRATEGIC PROTOCOLS (CRITICAL):
Milestones are NOT small daily tasks or micro-actions. They are HIGH-LEVEL STRATEGIC COMMITMENTS — 
ongoing protocols, routines, or behavioral standards the user commits to for the entire phase.

Think of them as STANDING ORDERS or LIFESTYLE PROTOCOLS, not to-do items.

## EXAMPLES OF GOOD vs BAD MILESTONES:
GOOD (strategic, general, protocol-level):
- "3x/week HIIT sprint sessions" / "3 אימוני ספרינט HIIT בשבוע"
- "Full-day mewing commitment" / "מיואינג מלא כל היום"
- "Daily 20-min cold exposure protocol" / "פרוטוקול קור יומי 20 דקות"
- "No processed food — whole foods only" / "אפס מזון מעובד — רק מזון שלם"
- "5am wake protocol — no snooze" / "קימה ב-5 בבוקר — בלי נודניק"
- "Weekly deep-work blocks (4h minimum)" / "בלוקי עבודה עמוקה שבועיים (4 שעות מינימום)"
- "Read 30 pages daily" / "קריאת 30 עמודים ביום"
- "Zero social media before noon" / "אפס רשתות חברתיות לפני הצהריים"
- "Shadowbox 3 rounds every morning" / "3 סיבובי שדוובוקסינג כל בוקר"

BAD (too granular, task-like, diagnostic):
- "Do 10 pushups on Monday" (too specific/small)
- "Write in journal for 5 minutes" (too micro)
- "Research cold exposure benefits" (diagnostic, not action)
- "Try a new exercise" (vague and one-time)
- "Set alarm for 5am" (setup task, not protocol)

## TREATMENT-ONLY RULES (CRITICAL):
- BANNED: "identify", "recognize", "notice", "become aware", "check if", "test whether", "evaluate", "assess", "journal about", "research", "learn about"
- REQUIRED: "execute", "perform", "practice", "commit to", "drill", "run protocol", "train", "maintain", "enforce"

## RULES:
- Each mission gets exactly 5 milestones — each is a STRATEGIC PROTOCOL or LIFESTYLE COMMITMENT.
- Milestones should include FREQUENCY (daily, 3x/week, etc.) or INTENSITY (full day, minimum hours, etc.) when applicable.
- They should be progressively more challenging across the 5.
- **MANDATORY**: Each milestone MUST have a unique "difficulty" field — the 5 milestones MUST use exactly [1, 2, 3, 4, 5] in ascending order:
  - Milestone 1 → difficulty: 1 (⭐ Beginner / easy habit)
  - Milestone 2 → difficulty: 2 (⭐⭐ Moderate effort)
  - Milestone 3 → difficulty: 3 (⭐⭐⭐ Challenging but achievable)
  - Milestone 4 → difficulty: 4 (⭐⭐⭐⭐ Hard, significant discipline)
  - Milestone 5 → difficulty: 5 (⭐⭐⭐⭐⭐ Elite level, extreme commitment)
- **WARNING**: If all 5 milestones have the same difficulty, your output will be REJECTED. Each MUST be different.
- CRITICAL: All milestones MUST stay within the pillar's scope.
- CRITICAL: All milestones MUST respect the user's CRITICAL CONSTRAINTS.
- Hebrew must be natural and punchy. Keep titles short but strategic.

## OUTPUT (JSON only, NO markdown):
{
  "missions": [
    {
      "mission_en": "${goals[0]?.goal_en || ''}",
      "mission_he": "${goals[0]?.goal_he || ''}",
      "milestones": [
        { "title_en": "Strategic protocol 1", "title_he": "פרוטוקול 1", "description_en": "What commitment looks like", "description_he": "איך זה נראה בפועל", "difficulty": 1 },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "...", "difficulty": 2 },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "...", "difficulty": 3 },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "...", "difficulty": 4 },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "...", "difficulty": 5 }
      ]
    },
    { "mission_en": "${goals[1]?.goal_en || ''}", "mission_he": "${goals[1]?.goal_he || ''}", "milestones": [...] },
    { "mission_en": "${goals[2]?.goal_en || ''}", "mission_he": "${goals[2]?.goal_he || ''}", "milestones": [...] }
  ]
}`;
}

// ========== AI CALL HELPER ==========
async function callAI(apiKey: string, prompt: string, systemMsg: string, maxTokens = 4000, retries = 2): Promise<any | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: maxTokens,
          temperature: 0.4,
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`AI call failed: ${response.status} (attempt ${attempt+1})`);
        if (attempt < retries) continue;
        return null;
      }

      const result = await response.json();
      const raw = result.choices?.[0]?.message?.content || '';
      const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        let fixed = jsonStr;
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        fixed = fixed.replace(/,\s*$/, '');
        fixed = fixed.replace(/,?\s*"[^"]*$/, '');
        
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) fixed += '}';
        
        try {
          parsed = JSON.parse(fixed);
          console.log(`  JSON auto-repaired successfully (attempt ${attempt+1})`);
        } catch (e2) {
          console.error(`AI parse error (attempt ${attempt+1}):`, e2);
          if (attempt < retries) continue;
          return null;
        }
      }
      return parsed;
    } catch (e) {
      console.error(`AI call exception (attempt ${attempt+1}):`, e);
      if (attempt < retries) continue;
      return null;
    }
  }
  return null;
}

// ========== 3-LAYER ORCHESTRATION: Traits → Missions (3 per trait) → Milestones ==========
async function generatePillarStrategy(
  apiKey: string,
  supabaseClient: any,
  userId: string,
  planId: string,
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
  constraintsBlock: string,
  traitCount: number, // 3 for selected, 1 for non-selected
): Promise<{ allMissions: any[]; traitIds: string[] } | null> {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  const sysMsg = "Output ONLY valid JSON. No markdown. No explanation.";

  // LAYER 0: Generate traits for this pillar
  console.log(`  [${pillarId}] Layer 0: generating ${traitCount} trait(s)...`);
  const traitResult = await callAI(apiKey, buildTraitPrompt(pillarId, hub, assessment, userContext, constraintsBlock, traitCount), sysMsg, 800);
  
  const traits = traitResult?.traits || [];
  
  // Ensure we have exactly traitCount traits (pad with fallbacks)
  const fallbackTraits = [
    { name_en: `${pillarId} Warrior`, name_he: `לוחם ה${pillarId}`, description_en: `Core ${pillarId} ability`, description_he: `יכולת ליבה`, icon: PILLAR_ICON_MAP[pillarId] || '⭐' },
    { name_en: `${pillarId} Architect`, name_he: `אדריכל ה${pillarId}`, description_en: `Strategic ${pillarId} ability`, description_he: `יכולת אסטרטגית`, icon: PILLAR_ICON_MAP[pillarId] || '⭐' },
    { name_en: `${pillarId} Master`, name_he: `אמן ה${pillarId}`, description_en: `Advanced ${pillarId} ability`, description_he: `יכולת מתקדמת`, icon: PILLAR_ICON_MAP[pillarId] || '⭐' },
  ];
  while (traits.length < traitCount) traits.push(fallbackTraits[traits.length % 3]);

  // Insert traits into skills table
  const traitIds: string[] = [];
  const traitMeta: { name_en: string; name_he: string; description_en: string; id: string }[] = [];
  
  for (let ti = 0; ti < traitCount; ti++) {
    const trait = traits[ti];
    const { data: skillRow } = await supabaseClient.from('skills').insert({
      name: trait.name_en,
      name_he: trait.name_he,
      description: trait.description_en,
      category: PILLAR_CATEGORY_MAP[pillarId] || 'mind',
      icon: trait.icon || PILLAR_ICON_MAP[pillarId] || '⭐',
      is_active: true,
      user_id: userId,
      pillar: pillarId, // CANONICAL pillar key — same as plan_missions.pillar
      life_plan_id: planId,
      trait_type: 'trait',
    }).select('id').single();

    if (skillRow) {
      traitIds.push(skillRow.id);
      traitMeta.push({ name_en: trait.name_en, name_he: trait.name_he, description_en: trait.description_en || '', id: skillRow.id });
      await supabaseClient.from('user_skill_progress').upsert({
        user_id: userId, skill_id: skillRow.id, xp_total: 0, level: 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,skill_id' });
      console.log(`  🎯 Trait created: "${trait.name_en}" → ${skillRow.id}`);
    } else {
      traitIds.push('');
      traitMeta.push({ name_en: trait.name_en, name_he: trait.name_he, description_en: trait.description_en || '', id: '' });
    }
  }

  // LAYER 1 + 2: For EACH trait, generate 3 missions + 5 milestones each
  const allMissions: any[] = [];
  
  for (let ti = 0; ti < traitCount; ti++) {
    const trait = traitMeta[ti];
    
    // Layer 1: 3 missions for this trait
    console.log(`  [${pillarId}] Layer 1: generating 3 missions for trait "${trait.name_en}"...`);
    const missionResult = await callAI(
      apiKey,
      buildMissionsForTraitPrompt(pillarId, hub, assessment, userContext, constraintsBlock, { name_en: trait.name_en, name_he: trait.name_he }, trait.description_en),
      sysMsg, 1200,
    );
    
    const goals = missionResult?.goals || [];
    if (goals.length < 3) {
      // Pad with fallback missions — use generic progressive labels, NOT trait name
      const fallbackLabels = [
        { goal_en: 'Foundation Protocol', goal_he: 'פרוטוקול יסוד' },
        { goal_en: 'Integration Drill', goal_he: 'תרגול שילוב' },
        { goal_en: 'Mastery Execution', goal_he: 'ביצוע מומחיות' },
      ];
      while (goals.length < 3) {
        goals.push(fallbackLabels[goals.length] || { goal_en: `Training Arc ${goals.length + 1}`, goal_he: `ארק אימון ${goals.length + 1}` });
      }
    }

    // Layer 2: 5 milestones per mission for this trait's 3 missions
    console.log(`  [${pillarId}] Layer 2: generating milestones for trait "${trait.name_en}"...`);
    const milestoneResult = await callAI(
      apiKey,
      buildMilestonesPrompt(pillarId, goals.slice(0, 3), assessmentBlock, constraintsBlock),
      sysMsg, 3000,
    );
    
    const missions = milestoneResult?.missions || [];
    
    // Map missions to this trait's index
    for (let mi = 0; mi < Math.min(missions.length, 3); mi++) {
      allMissions.push({
        ...missions[mi],
        trait_index: ti,
        // Ensure mission text is populated
        mission_en: missions[mi].mission_en || goals[mi]?.goal_en || '',
        mission_he: missions[mi].mission_he || goals[mi]?.goal_he || '',
      });
    }
    
    // If milestones call failed, create stub missions from goals
    if (missions.length === 0) {
      for (const g of goals.slice(0, 3)) {
        allMissions.push({
          mission_en: g.goal_en,
          mission_he: g.goal_he,
          trait_index: ti,
          milestones: [
            { title_en: "Foundation", title_he: "בסיס", description_en: "Foundation", description_he: "בסיס" },
            { title_en: "Practice", title_he: "תרגול", description_en: "Practice", description_he: "תרגול" },
            { title_en: "Mastery", title_he: "שליטה", description_en: "Mastery", description_he: "שליטה" },
            { title_en: "Integration", title_he: "שילוב", description_en: "Integration", description_he: "שילוב" },
            { title_en: "Excellence", title_he: "מצוינות", description_en: "Excellence", description_he: "מצוינות" },
          ],
        });
      }
    }
  }

  console.log(`  ✅ [${pillarId}] Complete: ${traitCount} traits × 3 missions = ${allMissions.length} missions`);
  return { allMissions, traitIds };
}

// ========== FALLBACK ==========
function _g(id: string, e1: string, h1: string, e2: string, h2: string, e3: string, h3: string) {
  const sg = (en: string, he: string) => ({ title_en: en, title_he: he, description_en: en, description_he: he });
  return { allMissions: [
    { mission_en: e1, mission_he: h1, trait_index: 0, milestones: [sg("Foundation","בסיס"), sg("Practice","תרגול"), sg("Mastery","שליטה"), sg("Integration","שילוב"), sg("Excellence","מצוינות")] },
    { mission_en: e2, mission_he: h2, trait_index: 0, milestones: [sg("Assessment","הערכה"), sg("Training","אימון"), sg("Integration","שילוב"), sg("Optimization","אופטימיזציה"), sg("Mastery","שליטה")] },
    { mission_en: e3, mission_he: h3, trait_index: 0, milestones: [sg("Planning","תכנון"), sg("Execution","ביצוע"), sg("Optimization","אופטימיזציה"), sg("Scaling","הרחבה"), sg("Mastery","שליטה")] },
  ], traitIds: [] };
}

// ========== MAIN HANDLER ==========
serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { user_id, hub, force_regenerate, selected_pillars, single_pillar, skip_quality_gate } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetHub = hub || 'both';

    // === GENERATION LOCK ===
    const { data: generatingPlans } = await supabaseClient
      .from('life_plans').select('id, created_at')
      .eq('user_id', user_id).eq('status', 'generating');
    
    if (generatingPlans && generatingPlans.length > 0) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const stale = generatingPlans.filter((p: any) => p.created_at < fiveMinAgo);
      if (stale.length > 0) {
        await supabaseClient.from('life_plans').delete().in('id', stale.map((p: any) => p.id));
        console.log(`Cleaned ${stale.length} stale generation locks`);
      } else {
        return new Response(JSON.stringify({ message: "Generation already in progress, please wait." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check existing plans
    let hubsToGenerate: ('core' | 'arena')[] = targetHub === 'both' ? ['core', 'arena'] : [targetHub as 'core' | 'arena'];
    
    const { data: existing } = await supabaseClient
      .from('life_plans').select('id, plan_data')
      .eq('user_id', user_id).eq('status', 'active')
      .order('created_at', { ascending: false });

    if (force_regenerate) {
      const allActiveIds = (existing || []).map((p: any) => p.id);
      if (allActiveIds.length > 0) {
        await supabaseClient.from('plan_missions').delete().in('plan_id', allActiveIds);
        await supabaseClient.from('action_items').delete().eq('user_id', user_id).in('plan_id', allActiveIds);
        await supabaseClient.from('life_plan_milestones').delete().in('plan_id', allActiveIds);
        await supabaseClient.from('skills').delete().eq('user_id', user_id).in('life_plan_id', allActiveIds);
        await supabaseClient.from('life_plans').update({ status: 'archived' }).in('id', allActiveIds);
        console.log(`Force regenerate: archived ${allActiveIds.length} existing plans`);
      }
    } else {
      const existingHubs = (existing || []).map((p: any) => p.plan_data?.hub).filter(Boolean);
      
      const legacyPlans = (existing || []).filter((p: any) => !p.plan_data?.hub);
      if (legacyPlans.length > 0) {
        const legacyIds = legacyPlans.map((p: any) => p.id);
        await supabaseClient.from('plan_missions').delete().in('plan_id', legacyIds);
        await supabaseClient.from('action_items').delete().eq('user_id', user_id).in('plan_id', legacyIds);
        await supabaseClient.from('life_plan_milestones').delete().in('plan_id', legacyIds);
        await supabaseClient.from('life_plans').update({ status: 'archived' }).in('id', legacyIds);
        console.log(`Auto-archived ${legacyIds.length} legacy (no-hub) plans`);
      }
      
      hubsToGenerate = hubsToGenerate.filter(h => !existingHubs.includes(h));
      
      if (hubsToGenerate.length === 0) {
        return new Response(JSON.stringify({ message: "Plans already exist", plans: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`Generating missing hubs: ${hubsToGenerate.join(', ')} (existing: ${existingHubs.join(', ')})`);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const results: any[] = [];

    // === FETCH USER DATA FOR AI CONTEXT ===
    const allPillarIds = [...CORE_PILLAR_IDS, ...ARENA_PILLAR_IDS];

    const [profileRes, domainsRes, projectsRes, businessRes, memoryRes, profileSelectedRes, launchpadRes] = await Promise.all([
      supabaseClient.from('profiles').select('*').eq('id', user_id).single(),
      supabaseClient.from('life_domains').select('domain_id, domain_config, status').eq('user_id', user_id).in('domain_id', allPillarIds),
      supabaseClient.from('user_projects').select('name, status, description, life_pillar, goals').eq('user_id', user_id).limit(10),
      supabaseClient.from('business_journeys').select('business_name, current_step, journey_complete, step_1_vision, step_2_business_model, step_8_marketing').eq('user_id', user_id).limit(5),
      supabaseClient.from('aurora_conversation_memory').select('summary, emotional_state, created_at').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
      supabaseClient.from('profiles').select('selected_pillars').eq('id', user_id).single(),
      supabaseClient.from('launchpad_progress').select('step_2_profile_data').eq('user_id', user_id).maybeSingle(),
    ]);

    const allDomains: PillarAssessment[] = (domainsRes.data || []) as PillarAssessment[];
    const constraintsBlock = buildStrategyConstraintsBlock(allDomains);

    // Extract hobbies/play preferences from onboarding data
    const launchpadProfile = (launchpadRes.data?.step_2_profile_data as Record<string, any>) || {};
    const onboardingHobbies = launchpadProfile.hobbies_play as string[] | undefined;
    const playQuest = (launchpadProfile.pillar_quests as any)?.play?.answers;
    const playActivities = playQuest?.play_activities as string[] | undefined;
    const allHobbies = [...new Set([...(onboardingHobbies || []), ...(playActivities || [])])];

    const userContext = buildUserContext(
      profileRes.data,
      projectsRes.data || [],
      businessRes.data || [],
      memoryRes.data || [],
      allHobbies,
    );
    
    // Determine which pillars are "selected" by the user
    const userSelectedPillars: Record<string, string[]> = profileSelectedRes.data?.selected_pillars || selected_pillars || {};

    // === ASSESSMENT QUALITY GATE ===
    if (!skip_quality_gate) {
      const targetPillarIds = single_pillar
        ? [single_pillar]
        : selected_pillars
          ? [...(selected_pillars.core || []), ...(selected_pillars.arena || [])]
          : undefined;

      const qualityCheck = validateHubReadiness(
        targetHub as 'core' | 'arena' | 'both',
        allDomains.map(d => ({ domain_id: d.domain_id, domain_config: d.domain_config })),
        targetPillarIds,
      );

      if (!qualityCheck.ready) {
        const missingPillars = qualityCheck.incompletePillars.map(ip => ({
          pillarId: ip.pillarId,
          reasonCode: ip.result.reasonCode,
          missingFields: ip.result.missingFields,
          missingQuestions: ip.result.missingQuestions,
        }));

        console.log(`❌ Assessment quality gate failed. Missing pillars: ${missingPillars.map(p => p.pillarId).join(', ')}`);

        return new Response(JSON.stringify({
          error: 'MISSING_ASSESSMENT_DATA',
          message: 'Some pillars need assessment completion before plan generation.',
          missing_pillars: missingPillars,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.log('⏭️ Quality gate skipped (onboarding mode) — using onboarding data as context');
    }

    for (const h of hubsToGenerate) {
      const allHubPillarIds = h === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
      const hubSelectedPillars = h === 'core' ? (userSelectedPillars.core || []) : (userSelectedPillars.arena || []);
      
      // Determine selected vs non-selected pillars for this hub
      let selectedPillarIds: string[];
      let nonSelectedPillarIds: string[];
      
      if (single_pillar) {
        selectedPillarIds = allHubPillarIds.includes(single_pillar) ? [single_pillar] : [];
        nonSelectedPillarIds = [];
      } else {
        const hubSelected = selected_pillars 
          ? (h === 'core' ? (selected_pillars.core || []) : (selected_pillars.arena || []))
          : hubSelectedPillars;
        if (hubSelected.length > 0) {
          selectedPillarIds = allHubPillarIds.filter((id: string) => hubSelected.includes(id));
          nonSelectedPillarIds = allHubPillarIds.filter((id: string) => !hubSelected.includes(id));
        } else {
          // No pillars selected for this hub — all get 1 trait (non-selected treatment)
          selectedPillarIds = [];
          nonSelectedPillarIds = allHubPillarIds;
        }
      }
      
      if (selectedPillarIds.length === 0 && nonSelectedPillarIds.length === 0) {
        console.log(`No pillars for ${h} hub, skipping`);
        continue;
      }
      
      console.log(`\n🚀 ${h} hub — Selected: [${selectedPillarIds.join(', ')}] | Non-selected: [${nonSelectedPillarIds.join(', ')}]`);
      
      const hubAssessments = allDomains.filter(d => allHubPillarIds.includes(d.domain_id));

      const strategyData = {
        hub: h,
        total_phases: TOTAL_PHASES,
        total_days: TOTAL_DAYS,
        days_per_phase: DAYS_PER_PHASE,
        phase_labels: PHASE_LABELS,
        title_en: h === 'core' ? '100-Day Core Transformation' : '100-Day Arena Execution',
        title_he: h === 'core' ? 'טרנספורמציה פנימית — 100 יום' : 'ביצוע בזירה — 100 יום',
        vision_en: h === 'core' ? 'Build unshakable internal systems for consciousness, energy, and identity.' : 'Create unstoppable momentum in wealth, influence, and impact.',
        vision_he: h === 'core' ? 'בנה מערכות פנימיות בלתי ניתנות לערעור.' : 'צור מומנטום בלתי ניתן לעצירה בעושר, השפעה ואימפקט.',
        ai_generated: true,
      };

      // Store plan
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + TOTAL_DAYS);

      const { data: plan, error: planError } = await supabaseClient
        .from('life_plans')
        .insert({
          user_id,
          duration_months: 3,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          plan_data: { hub: h, strategy: strategyData },
          status: 'generating',
          progress_percentage: 0,
        })
        .select('id')
        .single();

      if (planError) {
        console.error("Plan insert error:", planError);
        continue;
      }

      let totalMissions = 0;
      let totalMilestones = 0;
      let allAiSuccess = true;

      if (LOVABLE_API_KEY) {
        // Generate ALL pillars (selected with 3 traits, non-selected with 1 trait)
        const allPillarJobs = [
          ...selectedPillarIds.map(id => ({ pillarId: id, traitCount: 3 })),
          ...nonSelectedPillarIds.map(id => ({ pillarId: id, traitCount: 1 })),
        ];
        
        const aiPromises = allPillarJobs.map(async ({ pillarId, traitCount }) => {
          const assessment = hubAssessments.find(a => a.domain_id === pillarId);
          const result = await generatePillarStrategy(
            LOVABLE_API_KEY, supabaseClient, user_id, plan.id,
            pillarId, h, assessment, userContext, constraintsBlock, traitCount,
          );
          return { pillarId, traitCount, data: result };
        });

        const aiResults = await Promise.allSettled(aiPromises);
        
        for (const result of aiResults) {
          if (result.status === 'fulfilled' && result.value.data) {
            const { pillarId, traitCount } = result.value;
            const { allMissions, traitIds } = result.value.data;
            
            // Insert missions and milestones
            for (let mi = 0; mi < allMissions.length; mi++) {
              const mission = allMissions[mi];
              const traitIndex = mission.trait_index ?? Math.floor(mi / 3);
              const traitSkillId = traitIds[traitIndex] || traitIds[0] || null;
              
              const { data: missionRow, error: missionError } = await supabaseClient
                .from('plan_missions')
                .insert({
                  plan_id: plan.id,
                  pillar: pillarId, // CANONICAL: always matches skills.pillar
                  mission_number: mi + 1, // Globally unique per pillar: 1-9 for selected (3 traits × 3), 1-3 for non-selected
                  title: mission.mission_he || mission.goal_he || mission.mission_en || mission.goal_en,
                  title_en: mission.mission_en || mission.goal_en,
                  description: mission.mission_he || mission.goal_he,
                  description_en: mission.mission_en || mission.goal_en,
                  xp_reward: 50,
                  primary_skill_id: traitSkillId,
                })
                .select('id')
                .single();
              
              if (missionError) {
                console.error(`Mission insert error for ${pillarId}:`, missionError);
                continue;
              }
              totalMissions++;

              const milestones = mission.milestones || [];
              // Post-process: if all difficulties are identical or missing, force 1-5 progression
              const difficulties = milestones.map((ms: any) => ms.difficulty);
              const allSame = difficulties.length > 0 && difficulties.every((d: any) => d === difficulties[0]);
              const hasMissing = difficulties.some((d: any) => d == null || d === 0);
              const needsForcedProgression = allSame || hasMissing;
              if (needsForcedProgression) {
                for (let fi = 0; fi < milestones.length; fi++) {
                  milestones[fi].difficulty = fi + 1;
                }
              }

              for (let si = 0; si < Math.min(milestones.length, 5); si++) {
                const ms = milestones[si];
                const phaseNumber = Math.floor(mi / 3) * 3 + Math.min(si, 3) + 1;

                await supabaseClient.from('life_plan_milestones').insert({
                  plan_id: plan.id,
                  mission_id: missionRow.id,
                  milestone_number: si + 1,
                  week_number: Math.min(phaseNumber, TOTAL_PHASES),
                  month_number: Math.ceil(phaseNumber / 3),
                  title: ms.title_he || ms.title_en,
                  title_en: ms.title_en,
                  description: ms.description_he || ms.title_he,
                  description_en: ms.description_en || ms.title_en,
                  goal: ms.title_he,
                  goal_en: ms.title_en,
                  focus_area: pillarId,
                  focus_area_en: pillarId,
                  is_completed: false,
                  xp_reward: 20,
                  tokens_reward: 5,
                  difficulty: Math.max(1, Math.min(5, ms.difficulty ?? (si + 1))),
                });
                totalMilestones++;
              }
            }
            
            // Dev assertion logging
            const expectedMissions = traitCount * 3;
            const expectedMilestones = traitCount * 3 * 5;
            const actualMissions = allMissions.length;
            if (actualMissions !== expectedMissions) {
              console.warn(`⚠️ ASSERTION: [${pillarId}] expected ${expectedMissions} missions, got ${actualMissions}`);
            }
            console.log(`  📊 [${pillarId}] ${traitCount} traits × 3 missions × 5 milestones = ${actualMissions} missions generated`);
            
          } else {
            allAiSuccess = false;
            const pid = result.status === 'fulfilled' ? result.value.pillarId : 'unknown';
            console.error(`  [${pid}] Generation failed, using fallback`);
            
            // Insert fallback missions (3 missions for the pillar)
            const fb = _g(pid, "Transform " + pid, "טרנספורמציה " + pid, "Master " + pid, "שליטה ב" + pid, "Scale " + pid, "הרחבת " + pid);
            for (let mi = 0; mi < fb.allMissions.length; mi++) {
              const mission = fb.allMissions[mi];
              const { data: missionRow } = await supabaseClient.from('plan_missions').insert({
                plan_id: plan.id, pillar: pid, mission_number: mi + 1,
                title: mission.mission_he, title_en: mission.mission_en,
                description: mission.mission_he, description_en: mission.mission_en, xp_reward: 50,
              }).select('id').single();
              if (!missionRow) continue;
              totalMissions++;
              
              for (let si = 0; si < mission.milestones.length; si++) {
                const ms = mission.milestones[si];
                await supabaseClient.from('life_plan_milestones').insert({
                  plan_id: plan.id, mission_id: missionRow.id, milestone_number: si + 1,
                  week_number: mi * 3 + Math.min(si, 3) + 1, month_number: 1,
                  title: ms.title_he, title_en: ms.title_en,
                  description: ms.description_he, description_en: ms.description_en,
                  focus_area: pid, is_completed: false, xp_reward: 20, tokens_reward: 5,
                  difficulty: si + 1,
                });
                totalMilestones++;
              }
            }
          }
        }
      } else {
        console.error("LOVABLE_API_KEY not configured, using fallback for all");
        allAiSuccess = false;
      }

      // === ATOMIC FLIP ===
      const { data: oldPlansForHub } = await supabaseClient
        .from('life_plans').select('id, plan_data')
        .eq('user_id', user_id).eq('status', 'active');
      
      const hubPlanIds = (oldPlansForHub || [])
        .filter((p: any) => p.plan_data?.hub === h)
        .map((p: any) => p.id);
      
      if (hubPlanIds.length > 0) {
        await supabaseClient.from('plan_missions').delete().in('plan_id', hubPlanIds);
        await supabaseClient.from('action_items').delete().eq('user_id', user_id).in('plan_id', hubPlanIds);
        await supabaseClient.from('life_plan_milestones').delete().in('plan_id', hubPlanIds);
        await supabaseClient.from('life_plans').update({ status: 'archived' }).in('id', hubPlanIds);
        console.log(`Archived ${hubPlanIds.length} old ${h} plans`);
      }

      await supabaseClient.from('life_plans').update({ status: 'active' }).eq('id', plan.id);

      console.log(`✅ ${h} hub: ${totalMissions} missions, ${totalMilestones} milestones (AI: ${allAiSuccess})`);
      results.push({ hub: h, plan_id: plan.id, missions: totalMissions, milestones: totalMilestones, ai_generated: allAiSuccess });
    }

    return new Response(
      JSON.stringify({ success: true, plans: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-100day-strategy error:", e);
    try {
      const body2 = await req.clone().json().catch(() => ({}));
      if (body2?.user_id) {
        const supabase2 = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase2.from('life_plans').delete().eq('user_id', body2.user_id).eq('status', 'generating');
      }
    } catch (_) { /* ignore cleanup errors */ }
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
