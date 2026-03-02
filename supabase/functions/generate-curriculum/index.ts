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
      const systemPrompt = `You are Aurora, an elite instructor and curriculum architect. Based on the conversation, generate a DEMANDING, intensive curriculum that will transform the user from absolute beginner to professional.

This is NOT a casual learning experience. This is a BOOT CAMP. Make it rigorous, structured, and results-driven.

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "title": "Curriculum title",
  "title_en": "English title",
  "description": "2-3 sentence description of the transformation journey",
  "topic": "Core topic",
  "category": "one of: technology, business, creative, health, personal_growth, custom",
  "estimated_days": 30-90,
  "pillar": "closest matching pillar: consciousness, presence, power, vitality, focus, combat, expansion, wealth, influence, relationships, business, projects, play, order",
  "modules": [
    {
      "title": "Module title",
      "title_en": "English title",
      "description": "Module description",
      "difficulty": "beginner|intermediate|advanced|mastery",
      "lessons": [
        {
          "title": "Lesson title",
          "title_en": "English title",
          "lesson_type": "theory",
          "time_estimate_minutes": 15,
          "xp_reward": 10,
          "content": {
            "body": "Full lesson text with markdown. Be thorough — 800+ words. Include examples, diagrams described in text, analogies.",
            "key_concepts": ["concept1", "concept2"],
            "examples": ["Concrete example 1", "Concrete example 2"]
          }
        },
        {
          "title": "Practice: [topic]",
          "lesson_type": "practice",
          "time_estimate_minutes": 30,
          "xp_reward": 20,
          "content": {
            "instructions": "Detailed practice instructions",
            "exercises": [
              { "title": "Exercise 1", "description": "What to do", "difficulty": "easy|medium|hard", "expected_output": "What the result should look like" }
            ]
          }
        },
        {
          "title": "Quiz: [topic]",
          "lesson_type": "quiz",
          "time_estimate_minutes": 10,
          "xp_reward": 15,
          "content": {
            "questions": [
              { "q": "Question text", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why this is correct" }
            ]
          }
        },
        {
          "title": "Project: [deliverable]",
          "lesson_type": "project",
          "time_estimate_minutes": 60,
          "xp_reward": 50,
          "content": {
            "brief": "Project brief",
            "requirements": ["Req 1", "Req 2"],
            "deliverables": ["Deliverable 1"],
            "rubric": { "excellent": "Criteria for 90+", "good": "Criteria for 70-89", "passing": "Criteria for 50-69" }
          }
        }
      ]
    }
  ]
}

RULES:
- Generate 4-6 modules progressing from beginner to mastery
- Each module should have 4-8 lessons mixing theory, practice, quiz, and project
- Theory lessons must be THOROUGH (800+ words) — teach properly
- Practice exercises must be DEMANDING — push the user hard
- Quizzes must have 5-10 questions each with 4 options
- Projects must require REAL deliverables, not theoretical exercises
- Total curriculum should be 25-50 lessons
- XP rewards scale with difficulty: theory=10, practice=20, quiz=15, project=50
- Generate content in the SAME LANGUAGE the user used in conversation
- Make it progressively harder — mastery level should be genuinely challenging`;

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
      
      // Strip markdown code fences anywhere in the string
      raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      
      // Extract the JSON object from the response
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("No JSON object found in response. Raw:", raw.substring(0, 500));
        throw new Error("AI did not return valid JSON");
      }
      raw = raw.substring(jsonStart, jsonEnd + 1);

      // Fix common JSON issues from AI: control chars inside string values
      // We need to escape control characters that appear inside JSON string values
      const fixJson = (s: string) => {
        // Replace unescaped control characters inside strings
        return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                .replace(/\t/g, '    ')  // tabs to spaces
                // Fix unescaped newlines inside JSON string values
                .replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
                  return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
                });
      };

      let curriculum;
      try { 
        curriculum = JSON.parse(raw); 
      } catch (e1) {
        console.log("First parse failed:", (e1 as Error).message);
        try { 
          curriculum = JSON.parse(fixJson(raw)); 
        } catch (e2) {
          console.error("Second parse failed:", (e2 as Error).message, "JSON start:", raw.substring(0, 300));
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

IMPORTANT: This is NOT a gentle course. Aurora builds BOOT CAMPS. Push the user to commit to intensity.`;

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
