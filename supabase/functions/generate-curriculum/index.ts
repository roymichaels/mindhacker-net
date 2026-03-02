import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { messages, action, curriculumId } = await req.json();

    // ── ACTION: generate — Build full curriculum from conversation ──
    if (action === "generate") {
      const systemPrompt = `You are Aurora, an elite curriculum architect. Generate a COMPACT but intensive boot-camp curriculum.

Return a JSON object with this structure:
{
  "title": "Curriculum title",
  "title_en": "English title",
  "description": "Short description",
  "topic": "Core topic",
  "category": "technology|business|creative|health|personal_growth|custom",
  "estimated_days": 30,
  "pillar": "focus",
  "modules": [
    {
      "title": "Module title",
      "title_en": "English title",
      "description": "Module description",
      "difficulty": "beginner|intermediate|advanced",
      "lessons": [
        {
          "title": "Lesson title",
          "title_en": "English title",
          "lesson_type": "theory|practice|quiz|project",
          "time_estimate_minutes": 15,
          "xp_reward": 10,
          "content": {
            "body": "Lesson content (200-400 words). Clear and practical.",
            "key_concepts": ["concept1", "concept2"],
            "comprehension_questions": [
              { "q": "Question", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why" }
            ]
          }
        }
      ]
    }
  ]
}

RULES:
- Generate exactly 3 modules (beginner, intermediate, advanced)
- Each module: 3-4 lessons mixing theory, practice, quiz
- Keep lesson content CONCISE: 200-400 words max per body
- Each lesson has 2-3 comprehension_questions
- Total: 9-12 lessons
- Generate in the SAME LANGUAGE as conversation
- If Hebrew: include nikud on titles and key terms (not every word)
- XP: theory=10, practice=20, quiz=15, project=50`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
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
            { role: "user", content: "Based on our conversation, generate the complete curriculum JSON now. Make it demanding and thorough. Return ONLY valid JSON, no markdown." },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${status}`);
      }

      const aiData = await response.json();
      let raw = aiData.choices?.[0]?.message?.content || "";
      console.log("Raw AI response length:", raw.length, "first 200 chars:", raw.substring(0, 200));
      
      // Strip markdown code fences if present
      raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      
      // Extract JSON object
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        raw = raw.substring(jsonStart, jsonEnd + 1);
      }

      // Robust JSON fixer: escape control characters inside string values
      function fixJson(str: string): string {
        // Remove BOM
        str = str.replace(/^\uFEFF/, '');
        // Extract between first { and last }
        const start = str.indexOf('{');
        const end = str.lastIndexOf('}');
        if (start === -1 || end === -1) return str;
        str = str.substring(start, end + 1);
        // Escape control characters inside JSON string values
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
              // Escape control chars inside strings
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

      let curriculum;
      try { 
        curriculum = JSON.parse(raw); 
      } catch (e1) {
        console.error("Parse failed:", (e1 as Error).message);
        try {
          curriculum = JSON.parse(fixJson(raw));
          console.log("fixJson recovered the parse successfully");
        } catch (e2) {
          console.error("fixJson also failed:", (e2 as Error).message);
          throw new Error("Failed to parse curriculum JSON from AI response");
        }
      }

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
          estimated_days: curriculum.estimated_days || 30,
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

      // Save modules and lessons
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
            content: lesson.content || {},
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

      return new Response(JSON.stringify({ success: true, curriculum_id: curriculumDbId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: evaluate — Aurora evaluates a quiz/project submission ──
    if (action === "evaluate") {
      const { lessonId, submission, lessonContent, lessonType } = await req.json();

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

Your goal: Through 3-5 focused questions, understand exactly what to teach and build a boot-camp-level curriculum.

Questions to explore (adapt based on answers):
1. What do you want to master? (be specific — "Python for data science", not just "programming")
2. What's your current level? (complete beginner, some experience, intermediate)
3. What's your goal? (career change, side project, freelancing, personal mastery)
4. How intense do you want it? (Aurora pushes for maximum intensity)
5. How much time daily can you dedicate? (minimum 30 min/day expected)

Keep responses short (2-3 sentences + question). Be encouraging but DEMANDING — make it clear this won't be easy.
After gathering enough info (3-5 exchanges), say "🔥 אני מוכנה לבנות את תוכנית הלימודים!" or "🔥 I'm ready to build your curriculum!" and summarize the boot camp you'll create.

IMPORTANT: This is NOT a gentle course. Aurora builds BOOT CAMPS. Push the user to commit to intensity.

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
