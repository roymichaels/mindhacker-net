import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Robust JSON fixer: escape control characters inside string values
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

    // ── ACTION: generate — Build curriculum SKELETON (no lesson content) ──
    if (action === "generate") {
      const systemPrompt = `You are Aurora, an elite curriculum architect. Generate a SKELETON for an intensive boot-camp curriculum.

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
- If Hebrew: include nikud on titles and key terms
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

      // Save modules and lessons (no content)
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

        if (modErr || !modData) {
          console.error("Module insert error:", modErr);
          continue;
        }

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
            content: {}, // Empty — will be generated lazily
            xp_reward: lesson.xp_reward || 10,
            time_estimate_minutes: lesson.time_estimate_minutes || 15,
          });
          totalLessons++;
        }
      }

      // Update total lessons count
      await supabase
        .from("learning_curricula")
        .update({ total_lessons: totalLessons })
        .eq("id", curriculumDbId);

      // Create action items for plan integration
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
          metadata: {
            curriculum_id: curriculumDbId,
            module_index: mi,
            difficulty: mod.difficulty,
            lesson_count: mod.lessons?.length || 0,
          },
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

      // Fetch lesson + curriculum context
      const { data: lesson, error: lessonErr } = await supabase
        .from("learning_lessons")
        .select("id, title, title_en, lesson_type, order_index, module_id, curriculum_id, content")
        .eq("id", lessonId)
        .single();

      if (lessonErr || !lesson) throw new Error("Lesson not found");

      // If content already exists and has body/questions, return it
      const existingContent = lesson.content as Record<string, unknown> | null;
      if (existingContent && (existingContent.body || existingContent.questions || existingContent.instructions || existingContent.brief)) {
        return new Response(JSON.stringify({ success: true, content: existingContent, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get curriculum info for context
      const { data: curriculum } = await supabase
        .from("learning_curricula")
        .select("title, topic, description, curriculum_data")
        .eq("id", lesson.curriculum_id)
        .single();

      // Get module info
      const { data: mod } = await supabase
        .from("learning_modules")
        .select("title, difficulty, description")
        .eq("id", lesson.module_id)
        .single();

      const lessonType = lesson.lesson_type;
      const contentPrompt = `You are Aurora, an elite instructor. Generate FULL content for a single ${lessonType} lesson.

Course: "${curriculum?.title || 'Unknown'}"
Topic: "${curriculum?.topic || 'Unknown'}"  
Module: "${mod?.title || 'Unknown'}" (${mod?.difficulty || 'intermediate'})
Lesson: "${lesson.title}"

Generate content based on lesson type:

${lessonType === 'theory' ? `Return JSON:
{
  "body": "Full lesson content in markdown. 400-800 words. Clear, practical, with examples.",
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
  "brief": "Project description — what to build/create",
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
            { role: "system", content: "You are Aurora, an expert instructor. Generate lesson content. Return ONLY valid JSON." },
            { role: "user", content: contentPrompt },
          ],
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`AI error: ${response.status}`);

      const aiData = await response.json();
      const raw = aiData.choices?.[0]?.message?.content || "";
      const content = safeParseJson(raw);

      // Save content to lesson
      const { error: updateErr } = await supabase
        .from("learning_lessons")
        .update({ content })
        .eq("id", lessonId);

      if (updateErr) throw new Error("Failed to save lesson content: " + updateErr.message);

      return new Response(JSON.stringify({ success: true, content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: evaluate — Aurora evaluates a quiz/project submission ──
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

Your goal: Through 3-5 focused questions, understand exactly what to teach and build a boot-camp-level curriculum with ~50 lessons.

Questions to explore (adapt based on answers):
1. What do you want to master? (be specific — "Python for data science", not just "programming")
2. What's your current level? (complete beginner, some experience, intermediate)
3. What's your goal? (career change, side project, freelancing, personal mastery)
4. How intense do you want it? (Aurora pushes for maximum intensity)
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
