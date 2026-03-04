import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Robust JSON fixer
function fixJson(str: string): string {
  str = str.replace(/^\uFEFF/, '');
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}');
  if (start === -1 || end === -1) return str;
  str = str.substring(start, end + 1);
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        if (ch === '\n') result += '\\n';
        else if (ch === '\r') result += '\\r';
        else if (ch === '\t') result += '\\t';
        else result += '\\u' + code.toString(16).padStart(4, '0');
        continue;
      }
    }
    result += ch;
  }
  return result;
}

function safeParseJson(raw: string) {
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) raw = raw.substring(jsonStart, jsonEnd + 1);
  try { return JSON.parse(raw); } catch {
    try { return JSON.parse(fixJson(raw)); } catch (e2) {
      throw new Error("Failed to parse JSON from AI response: " + (e2 as Error).message);
    }
  }
}

// ─── Fetch user's full brain context for personalization ───
async function fetchUserBrainContext(supabase: any, userId: string): Promise<string> {
  const [
    profileRes,
    onboardingRes,
    launchpadRes,
    lifeDomainsRes,
    directionRes,
    identityRes,
    energyRes,
    visionsRes,
    hypnosisRes,
    projectsRes,
    lifePlanRes,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, display_name, bio, gender, preferred_tone, challenge_intensity, level, experience").eq("id", userId).single(),
    supabase.from("aurora_onboarding_progress").select("direction_clarity, identity_understanding, energy_patterns_status, energy_level, mood_signals").eq("user_id", userId).maybeSingle(),
    supabase.from("launchpad_progress").select("step_1_intention, step_2_profile_data, step_3_lifestyle_data, launchpad_complete").eq("user_id", userId).maybeSingle(),
    supabase.from("life_domains").select("domain_id, domain_config, status").eq("user_id", userId),
    supabase.from("aurora_life_direction").select("content, clarity_score").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("aurora_identity_elements").select("element_type, content").eq("user_id", userId).limit(20),
    supabase.from("aurora_energy_patterns").select("pattern_type, description").eq("user_id", userId).limit(10),
    supabase.from("aurora_life_visions").select("timeframe, title, description, focus_areas").eq("user_id", userId).limit(5),
    supabase.from("hypnosis_sessions").select("ego_state, action, duration_seconds, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("user_projects").select("name, category, progress_percentage, status").eq("user_id", userId).in("status", ["active", "paused"]).limit(10),
    supabase.from("life_plans").select("title, status, progress_percentage, current_week, total_weeks").eq("user_id", userId).eq("status", "active").maybeSingle(),
  ]);

  const profile = profileRes.data;
  const onboarding = onboardingRes.data;
  const launchpad = launchpadRes.data;
  const lifeDomains = lifeDomainsRes.data || [];
  const direction = directionRes.data?.[0];
  const identity = identityRes.data || [];
  const energy = energyRes.data || [];
  const visions = visionsRes.data || [];
  const hypnosis = hypnosisRes.data || [];
  const projects = projectsRes.data || [];
  const lifePlan = lifePlanRes.data;

  // Extract consciousness pillar data
  const consciousnessDomain = lifeDomains.find((d: any) => d.domain_id === 'consciousness');
  const consciousnessAssessment = consciousnessDomain?.domain_config?.latest_assessment;
  
  // Extract vitality / biological profile
  const vitalityDomain = lifeDomains.find((d: any) => d.domain_id === 'vitality');
  const vitalityData = vitalityDomain?.domain_config?.latest_assessment?.rawInputsUsed || {};

  // Extract all domain scores
  const domainScores = lifeDomains.map((d: any) => {
    const score = d.domain_config?.latest_assessment?.scores?.overall ?? d.domain_config?.latest_assessment?.overallScore;
    return { domain: d.domain_id, score, status: d.status };
  }).filter((d: any) => d.score != null);

  // Launchpad diagnostic scores
  const diagnosticScores = launchpad?.step_1_intention?.diagnostic_scores;
  const selectedPillar = launchpad?.step_1_intention?.selected_pillar;
  const profileData = launchpad?.step_2_profile_data || {};
  const lifestyleData = launchpad?.step_3_lifestyle_data || {};

  // Build willingness map from domains
  const willingness: Record<string, any> = {};
  for (const d of lifeDomains) {
    const raw = d.domain_config?.latest_assessment?.rawInputsUsed;
    if (raw?.willing || raw?.not_willing || raw?.constraints) {
      willingness[d.domain_id] = { willing: raw.willing || [], not_willing: raw.not_willing || [], constraints: raw.constraints || [] };
    }
  }

  // Identity elements
  const values = identity.filter((i: any) => i.element_type === 'value').map((i: any) => i.content);
  const principles = identity.filter((i: any) => i.element_type === 'principle').map((i: any) => i.content);
  const selfConcepts = identity.filter((i: any) => i.element_type === 'self_concept').map((i: any) => i.content);

  // Hypnosis summary (consciousness + ego states)
  const hypnosisSummary = hypnosis.length > 0
    ? `Recent hypnosis sessions (${hypnosis.length}): ${[...new Set(hypnosis.map((h: any) => h.ego_state))].join(', ')}. Latest actions: ${hypnosis.slice(0, 3).map((h: any) => h.action).filter(Boolean).join('; ')}`
    : 'No hypnosis sessions yet.';

  const lines: string[] = [];
  lines.push('=== USER BRAIN CONTEXT (Living System) ===');
  
  if (profile) {
    lines.push(`\nUser: ${profile.full_name || profile.display_name || 'Unknown'}`);
    lines.push(`Level: ${profile.level || 1} | XP: ${profile.experience || 0}`);
    if (profile.bio) lines.push(`Bio: ${profile.bio}`);
    if (profile.gender) lines.push(`Gender: ${profile.gender}`);
    lines.push(`Tone: ${profile.preferred_tone || 'default'} | Challenge intensity: ${profile.challenge_intensity || 'balanced'}`);
  }

  if (selectedPillar) lines.push(`\nPrimary pillar: ${selectedPillar}`);

  if (diagnosticScores) {
    lines.push(`\nDiagnostic scores:`);
    for (const [k, v] of Object.entries(diagnosticScores)) {
      lines.push(`  ${k}: ${v}%`);
    }
  }

  if (profileData.age_bracket) lines.push(`Age bracket: ${profileData.age_bracket}`);
  if (profileData.activity_level) lines.push(`Activity level: ${profileData.activity_level}`);

  if (lifestyleData.sleep_quality) lines.push(`Sleep quality: ${lifestyleData.sleep_quality}`);
  if (lifestyleData.stress_level) lines.push(`Stress level: ${lifestyleData.stress_level}`);

  if (direction) {
    lines.push(`\nLife direction: ${direction.content}`);
    if (direction.clarity_score) lines.push(`Direction clarity: ${direction.clarity_score}%`);
  }

  if (values.length) lines.push(`\nCore values: ${values.join(', ')}`);
  if (principles.length) lines.push(`Principles: ${principles.join(', ')}`);
  if (selfConcepts.length) lines.push(`Self-concepts: ${selfConcepts.join(', ')}`);

  if (visions.length) {
    lines.push(`\nLife visions:`);
    visions.forEach((v: any) => lines.push(`  [${v.timeframe}] ${v.title}${v.focus_areas?.length ? ` — focus: ${v.focus_areas.join(', ')}` : ''}`));
  }

  if (energy.length) {
    lines.push(`\nEnergy patterns:`);
    energy.forEach((e: any) => lines.push(`  [${e.pattern_type}] ${e.description}`));
  }

  if (onboarding) {
    lines.push(`\nOnboarding state: direction=${onboarding.direction_clarity}, identity=${onboarding.identity_understanding}, energy=${onboarding.energy_patterns_status}`);
    if (onboarding.energy_level) lines.push(`Energy level: ${onboarding.energy_level}`);
  }

  if (domainScores.length) {
    lines.push(`\nDomain scores:`);
    domainScores.forEach((d: any) => lines.push(`  ${d.domain}: ${d.score}/100 (${d.status})`));
  }

  if (consciousnessAssessment) {
    lines.push(`\nConsciousness pillar:`);
    if (consciousnessAssessment.mirror_statement) lines.push(`  Mirror statement: ${consciousnessAssessment.mirror_statement}`);
    if (consciousnessAssessment.scores) {
      for (const [k, v] of Object.entries(consciousnessAssessment.scores)) {
        lines.push(`  ${k}: ${v}`);
      }
    }
  }

  lines.push(`\n${hypnosisSummary}`);

  if (Object.keys(willingness).length) {
    lines.push(`\nWillingness boundaries:`);
    for (const [domain, w] of Object.entries(willingness) as any) {
      const parts = [];
      if (w.willing?.length) parts.push(`willing: ${w.willing.join(', ')}`);
      if (w.not_willing?.length) parts.push(`NOT willing: ${w.not_willing.join(', ')}`);
      if (w.constraints?.length) parts.push(`constraints: ${w.constraints.join(', ')}`);
      if (parts.length) lines.push(`  [${domain}] ${parts.join(' | ')}`);
    }
  }

  // Biological profile
  if (vitalityData.diet_type || profileData.activity_level) {
    lines.push(`\nBiological profile:`);
    if (vitalityData.diet_type) lines.push(`  Diet: ${Array.isArray(vitalityData.diet_type) ? vitalityData.diet_type.join(', ') : vitalityData.diet_type}`);
    if (vitalityData.sleep_time) lines.push(`  Sleep: ${vitalityData.sleep_time} — ${vitalityData.wake_time || '?'}`);
    if (vitalityData.caffeine) lines.push(`  Caffeine: ${vitalityData.caffeine}`);
  }

  if (projects.length) {
    lines.push(`\nActive projects:`);
    projects.forEach((p: any) => lines.push(`  ${p.name} (${p.category || '?'}) — ${p.progress_percentage || 0}%`));
  }

  if (lifePlan) {
    lines.push(`\n100-day plan: "${lifePlan.title}" — week ${lifePlan.current_week}/${lifePlan.total_weeks}, ${lifePlan.progress_percentage || 0}% complete`);
  }

  lines.push('\n=== END BRAIN CONTEXT ===');

  return lines.join('\n');
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader || "" } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { messages, action } = body;

    // ── Fetch brain context for ALL actions ──
    const brainContext = await fetchUserBrainContext(supabase, user.id);

    // ── ACTION: generate — Build curriculum SKELETON (no lesson content) ──
    if (action === "generate") {
      const systemPrompt = `You are Aurora, an elite curriculum architect. Generate a SKELETON for an intensive boot-camp curriculum.

${brainContext}

USE THE BRAIN CONTEXT ABOVE TO PERSONALIZE:
- Adapt difficulty based on user's level, domain scores, and diagnostic results
- Respect willingness boundaries and biological constraints (e.g., if vegan — no meat examples)
- Link to user's active projects, life direction, and consciousness insights
- If the topic relates to a life pillar, use the user's domain scores to calibrate starting point
- If consciousness data exists, weave identity/self-awareness elements into personal-growth curricula
- If hypnosis ego states are present, reference them for emotional regulation or mindset modules

IMPORTANT: Generate ONLY metadata — NO lesson content/body. Content will be generated lazily later.

Return a JSON object with this structure:
{
  "title": "Curriculum title",
  "title_en": "English title",
  "description": "Short description",
  "topic": "Core topic",
  "category": "technology|business|creative|health|personal_growth|custom",
  "estimated_days": 50,
  "pillar": "focus",
  "modules": [
    {
      "title": "Module title",
      "title_en": "English title",
      "description": "Module description (1 sentence)",
      "difficulty": "beginner|intermediate|advanced",
      "lessons": [
        {
          "title": "Lesson title",
          "title_en": "English title",
          "lesson_type": "theory|practice|quiz|project",
          "time_estimate_minutes": 15,
          "xp_reward": 10
        }
      ]
    }
  ]
}

RULES:
- Generate 8-10 modules progressing from beginner to advanced
- Each module: 4-6 lessons mixing theory, practice, quiz types
- Last module should have a capstone project lesson
- Total target: ~50 lessons
- DO NOT include "content" field in lessons — only title, title_en, lesson_type, time_estimate_minutes, xp_reward
- Generate in the SAME LANGUAGE as conversation
- If Hebrew: write in כתיב מלא (plene spelling) WITHOUT nikud marks. Add vowel letters (י for chirik/tsere, ו for holam/shuruk) to maximize readability. For example: "לִימוּד" → "ליימוד", "תִּרְגּוּל" → "תירגול", "מוּשָׂג" → "מושג". Never use nikud dots.
- XP: theory=10, practice=20, quiz=15, project=50
- Keep module descriptions to 1 sentence
- This is a SKELETON — keep it lean and fast`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            { role: "user", content: "Generate the curriculum skeleton JSON now. Return ONLY valid JSON. No lesson content — only titles and types." },
          ],
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${status}`);
      }

      const aiData = await response.json();
      const raw = aiData.choices?.[0]?.message?.content || "";
      console.log("Raw AI response length:", raw.length);

      const curriculum = safeParseJson(raw);

      // Save to database
      const { data: currData, error: currErr } = await supabase
        .from("learning_curricula")
        .insert({
          user_id: user.id,
          title: curriculum.title || "Curriculum",
          title_en: curriculum.title_en,
          description: curriculum.description,
          topic: curriculum.topic || "General",
          category: curriculum.category || "custom",
          estimated_days: curriculum.estimated_days || 50,
          pillar: curriculum.pillar,
          status: "active",
          curriculum_data: curriculum,
          total_modules: curriculum.modules?.length || 0,
        })
        .select("id")
        .single();

      if (currErr || !currData) throw new Error("Failed to save curriculum: " + (currErr?.message || ""));

      const curriculumDbId = currData.id;
      let totalLessons = 0;

      for (let mi = 0; mi < (curriculum.modules || []).length; mi++) {
        const mod = curriculum.modules[mi];
        const { data: modData, error: modErr } = await supabase
          .from("learning_modules")
          .insert({
            curriculum_id: curriculumDbId,
            title: mod.title,
            title_en: mod.title_en,
            description: mod.description,
            difficulty: mod.difficulty || "beginner",
            order_index: mi,
            status: mi === 0 ? "active" : "locked",
            total_lessons: mod.lessons?.length || 0,
            xp_reward: 50,
          })
          .select("id")
          .single();

        if (modErr || !modData) { console.error("Module insert error:", modErr); continue; }

        for (let li = 0; li < (mod.lessons || []).length; li++) {
          const lesson = mod.lessons[li];
          await supabase.from("learning_lessons").insert({
            module_id: modData.id,
            curriculum_id: curriculumDbId,
            user_id: user.id,
            title: lesson.title,
            title_en: lesson.title_en,
            lesson_type: lesson.lesson_type || "theory",
            order_index: li,
            status: mi === 0 && li === 0 ? "active" : "locked",
            content: {},
            xp_reward: lesson.xp_reward || 10,
            time_estimate_minutes: lesson.time_estimate_minutes || 15,
          });
          totalLessons++;
        }
      }

      await supabase.from("learning_curricula").update({ total_lessons: totalLessons }).eq("id", curriculumDbId);

      // Create action items
      for (let mi = 0; mi < (curriculum.modules || []).length; mi++) {
        const mod = curriculum.modules[mi];
        await supabase.from("action_items").insert({
          user_id: user.id,
          type: "milestone",
          source: "learning",
          status: mi === 0 ? "doing" : "todo",
          title: `📚 ${mod.title}`,
          description: mod.description,
          pillar: curriculum.pillar || "focus",
          xp_reward: 50,
          metadata: { curriculum_id: curriculumDbId, module_index: mi, difficulty: mod.difficulty, lesson_count: mod.lessons?.length || 0 },
        });
      }

      return new Response(JSON.stringify({ success: true, curriculum_id: curriculumDbId, total_lessons: totalLessons }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: generate-lesson-content — Lazy content generation for a single lesson ──
    if (action === "generate-lesson-content") {
      const { lessonId } = body;
      if (!lessonId) throw new Error("lessonId required");

      const { data: lesson, error: lessonErr } = await supabase
        .from("learning_lessons")
        .select("id, title, title_en, lesson_type, order_index, module_id, curriculum_id, content")
        .eq("id", lessonId)
        .single();

      if (lessonErr || !lesson) throw new Error("Lesson not found");

      const existingContent = lesson.content as Record<string, unknown> | null;
      if (existingContent && (existingContent.body || existingContent.questions || existingContent.instructions || existingContent.brief)) {
        return new Response(JSON.stringify({ success: true, content: existingContent, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: curriculum } = await supabase
        .from("learning_curricula")
        .select("title, topic, description, curriculum_data")
        .eq("id", lesson.curriculum_id)
        .single();

      const { data: mod } = await supabase
        .from("learning_modules")
        .select("title, difficulty, description")
        .eq("id", lesson.module_id)
        .single();

      const lessonType = lesson.lesson_type;
      const contentPrompt = `You are Aurora, an elite instructor. Generate FULL content for a single ${lessonType} lesson.

${brainContext}

USE THE BRAIN CONTEXT ABOVE TO PERSONALIZE:
- Reference user's real projects, goals, or life direction in examples when relevant
- Respect biological constraints (diet, sleep patterns) in health/wellness content
- If consciousness data exists, integrate self-awareness angles into practice exercises
- Adapt language complexity and metaphors to user's challenge_intensity and tone preference
- If this relates to a pillar the user has assessed, use their actual scores as baseline references

Course: "${curriculum?.title || 'Unknown'}"
Topic: "${curriculum?.topic || 'Unknown'}"  
Module: "${mod?.title || 'Unknown'}" (${mod?.difficulty || 'intermediate'})
Lesson: "${lesson.title}"

Generate content based on lesson type:

${lessonType === 'theory' ? `Return JSON:
{
  "body": "Full lesson content in markdown. 400-800 words. Clear, practical, with examples personalized to the user.",
  "key_concepts": ["concept1", "concept2", "concept3"],
  "examples": ["Example 1 description", "Example 2 description"],
  "comprehension_questions": [
    { "q": "Question?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why A is correct" }
  ]
}
Include 2-3 comprehension questions.` : ''}

${lessonType === 'practice' ? `Return JSON:
{
  "instructions": "Practice session instructions in markdown. What to do and why.",
  "exercises": [
    { "title": "Exercise 1", "description": "What to do", "difficulty": "easy|medium|hard", "expected_output": "What success looks like" }
  ],
  "comprehension_questions": [
    { "q": "Question?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why" }
  ]
}
Include 2-4 exercises and 2 comprehension questions.` : ''}

${lessonType === 'quiz' ? `Return JSON:
{
  "questions": [
    { "q": "Question?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why this is correct" }
  ]
}
Include 5-8 questions testing knowledge from this module.` : ''}

${lessonType === 'project' ? `Return JSON:
{
  "brief": "Project description — what to build/create. Personalize to user's real goals/projects if relevant.",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "rubric": { "completeness": 40, "quality": 30, "creativity": 30 },
  "comprehension_questions": [
    { "q": "Question?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why" }
  ]
}` : ''}

RULES:
- Write in the SAME LANGUAGE as the lesson title
- If Hebrew: include nikud (נִקּוּד) on titles and key terms
- Be demanding but clear
- Content should be practical and actionable
- Personalize examples to the user's actual life context when possible
- Return ONLY valid JSON`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 50000);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are Aurora, an expert instructor. Generate lesson content personalized to the user. Return ONLY valid JSON." },
            { role: "user", content: contentPrompt },
          ],
        }),
      });

      clearTimeout(timeout);
      if (!response.ok) throw new Error(`AI error: ${response.status}`);

      const aiData = await response.json();
      const raw = aiData.choices?.[0]?.message?.content || "";
      const content = safeParseJson(raw);

      const { error: updateErr } = await supabase.from("learning_lessons").update({ content }).eq("id", lessonId);
      if (updateErr) throw new Error("Failed to save lesson content: " + updateErr.message);

      return new Response(JSON.stringify({ success: true, content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: evaluate ──
    if (action === "evaluate") {
      const { lessonId, submission, lessonContent, lessonType } = body;

      const evalPrompt = lessonType === "quiz"
        ? `Evaluate this quiz submission. The questions and correct answers are provided. Calculate the score (0-100) and provide brief feedback for each wrong answer.
          Questions: ${JSON.stringify(lessonContent?.questions)}
          User answers: ${JSON.stringify(submission)}
          Return JSON: { "score": number, "feedback": [{ "question_index": number, "correct": boolean, "explanation": string }] }`
        : `Evaluate this project submission against the rubric. Be demanding but fair.
          Brief: ${lessonContent?.brief}
          Requirements: ${JSON.stringify(lessonContent?.requirements)}
          Rubric: ${JSON.stringify(lessonContent?.rubric)}
          Submission: ${JSON.stringify(submission)}
          Return JSON: { "score": number, "feedback": string, "strengths": [string], "improvements": [string], "pass": boolean }`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a strict but fair instructor evaluating student work. Return only JSON." },
            { role: "user", content: evalPrompt },
          ],
        }),
      });

      if (!response.ok) throw new Error(`AI error: ${response.status}`);

      const aiData = await response.json();
      let raw = aiData.choices?.[0]?.message?.content || "";
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      let evaluation;
      try { evaluation = JSON.parse(raw); } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        evaluation = match ? JSON.parse(match[0]) : { score: 0, feedback: "Could not evaluate" };
      }

      return new Response(JSON.stringify({ success: true, evaluation }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DEFAULT: Chat — Aurora asks questions to understand what to teach ──
    const systemPrompt = `You are Aurora, an elite instructor and curriculum architect. You're helping a user design a personalized, DEMANDING learning curriculum.

${brainContext}

USE THE BRAIN CONTEXT ABOVE TO:
- Reference the user's goals, projects, and life direction when asking questions
- Suggest topics that align with their active pillars, consciousness insights, or current 100-day plan
- Adapt your tone to their preferred_tone and challenge_intensity
- If they're working on something (projects, business), suggest related learning paths
- If consciousness/hypnosis data exists, suggest personal development angles

Your goal: Through 3-5 focused questions, understand exactly what to teach and build a boot-camp-level curriculum with ~50 lessons.

Questions to explore (adapt based on context — you may already know some answers from brain context):
1. What do you want to master? (be specific — suggest options based on their projects/pillars)
2. What's your current level? (check domain scores if relevant)
3. What's your goal? (reference their life direction or visions)
4. How intense do you want it? (check their challenge_intensity preference)
5. How much time daily can you dedicate? (minimum 30 min/day expected)

Keep responses short (2-3 sentences + question). Be encouraging but DEMANDING — make it clear this won't be easy.
After gathering enough info (3-5 exchanges), say "🔥 אני מוכנה לבנות את תוכנית הלימודים!" or "🔥 I'm ready to build your curriculum!" and summarize the boot camp you'll create.

IMPORTANT: This is NOT a gentle course. Aurora builds BOOT CAMPS with ~50 intensive lessons. Push the user to commit to intensity.

CRITICAL HEBREW RULE: If the user writes in Hebrew, you MUST respond with full nikud (נִקּוּד מָלֵא) on every Hebrew word — no exceptions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("generate-curriculum error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
