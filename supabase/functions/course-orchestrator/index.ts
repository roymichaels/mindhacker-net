import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Course Orchestrator — Plan-Driven Course Generation
 * 
 * Analyzes the user's 100-day plan traits/skills and generates:
 * - 2–3 "must" courses (required for progression, inject daily learning tasks)
 * - 3–5 "suggested" courses (optional, visible in Learn section)
 * 
 * Courses bind to the Trait layer: Pillar → Trait → Course → Mission
 * 
 * Called automatically after strategy generation (fire-and-forget chain).
 */

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

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
  try { return JSON.parse(raw); } catch {}
  try { return JSON.parse(fixJson(raw)); } catch {}
  throw new Error("Failed to parse AI response as JSON");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, plan_ids } = await req.json();
    if (!user_id) throw new Error("user_id required");

    console.log(`[course-orchestrator] Starting for user ${user_id}, plans: ${plan_ids?.join(',') || 'all'}`);

    // 1. Fetch user's active traits/skills from the plan
    const skillsQuery = supabase
      .from('skills')
      .select('id, name, name_he, pillar, category, description')
      .eq('user_id', user_id)
      .eq('is_active', true);
    
    if (plan_ids?.length) {
      skillsQuery.in('life_plan_id', plan_ids);
    }

    const { data: skills, error: skillsErr } = await skillsQuery;
    if (skillsErr) throw new Error("Failed to fetch skills: " + skillsErr.message);

    if (!skills || skills.length === 0) {
      console.log("[course-orchestrator] No active skills found, skipping");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_skills" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check existing courses to avoid duplicates
    const { data: existingCourses } = await supabase
      .from('learning_curricula')
      .select('id, title, skill_id, pillar, course_priority, status')
      .eq('user_id', user_id)
      .in('status', ['active', 'generating']);

    const existingSkillIds = new Set((existingCourses || []).map(c => c.skill_id).filter(Boolean));
    const existingPillars = new Set((existingCourses || []).map(c => c.pillar).filter(Boolean));

    // 3. Fetch user profile for personalization context
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, level, experience, ego_state_usage')
      .eq('id', user_id)
      .single();

    // 4. Fetch pillar assessments for gap analysis
    const { data: assessments } = await supabase
      .from('user_domain_assessments')
      .select('domain_id, domain_config, status')
      .eq('user_id', user_id)
      .eq('status', 'complete');

    // 5. Build AI prompt
    const skillsSummary = skills.map(s => 
      `- ${s.name} (${s.name_he || ''}) [Pillar: ${s.pillar || 'general'}, Category: ${s.category}]${s.description ? ': ' + s.description : ''}`
    ).join('\n');

    const existingCourseSummary = (existingCourses || []).length > 0
      ? `\n\nEXISTING COURSES (do NOT duplicate these):\n${(existingCourses || []).map(c => `- "${c.title}" [pillar: ${c.pillar}, priority: ${c.course_priority}]`).join('\n')}`
      : '';

    const assessmentSummary = (assessments || []).map(a => {
      const score = a.domain_config?.latest_assessment?.overall_index;
      return `- ${a.domain_id}: ${score != null ? score + '/100' : 'assessed'}`;
    }).join('\n');

    const systemPrompt = `You are Aurora, an elite curriculum strategist analyzing a user's 100-day transformation plan to recommend targeted courses.

USER CONTEXT:
- Level: ${profile?.level || 1}
- XP: ${profile?.experience || 0}

ACTIVE TRAITS/SKILLS FROM PLAN:
${skillsSummary}

PILLAR ASSESSMENTS:
${assessmentSummary || 'No assessments available'}
${existingCourseSummary}

TASK: Analyze capability gaps and generate course recommendations.

RULES:
1. Generate 2-3 "must" courses — essential capability builders the user NEEDS
2. Generate 3-5 "suggested" courses — optional but relevant
3. Each course should train a specific trait/skill from the list above
4. Match each course to the skill_id it serves (use exact IDs from the list)
5. Do NOT recommend courses for skills that already have existing courses
6. Course titles should be compelling and action-oriented
7. Generate in Hebrew with English translations
8. Keep descriptions to 1-2 sentences
9. Each course should have 4-8 modules with 3-5 lessons each
10. Lessons should be 5-10 minutes each
11. XP: theory=10, practice=20, quiz=15, project=50

Return JSON:
{
  "courses": [
    {
      "skill_id": "uuid-from-skills-list",
      "priority": "must" | "suggested",
      "title": "Hebrew title",
      "title_en": "English title",
      "description": "1-2 sentence description",
      "pillar": "pillar-id",
      "topic": "core topic",
      "category": "personal_growth|business|health|technology|creative|custom",
      "estimated_days": 30,
      "modules": [
        {
          "title": "Module title",
          "title_en": "English module title",
          "description": "1 sentence",
          "difficulty": "beginner|intermediate|advanced",
          "lessons": [
            {
              "title": "Lesson title",
              "title_en": "English lesson title",
              "lesson_type": "theory|practice|quiz|project",
              "time_estimate_minutes": 8,
              "xp_reward": 10
            }
          ]
        }
      ]
    }
  ]
}`;

    if (!LOVABLE_API_KEY) {
      console.warn("[course-orchestrator] No LOVABLE_API_KEY, generating fallback courses");
      return new Response(JSON.stringify({ 
        success: true, 
        skipped: true, 
        reason: "no_api_key",
        skills_count: skills.length 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Call AI
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          { role: "user", content: "Analyze the user's traits and generate course recommendations. Return ONLY valid JSON." },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!aiResponse.ok) {
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    console.log(`[course-orchestrator] AI response length: ${raw.length}`);

    const result = safeParseJson(raw);
    const courses = result.courses || [];

    console.log(`[course-orchestrator] Generated ${courses.length} course recommendations`);

    // 7. Save courses to database (reusing generate-curriculum's pattern)
    const savedCourses: any[] = [];
    let totalMustCourses = 0;

    for (const course of courses) {
      // Skip if skill already has a course
      if (course.skill_id && existingSkillIds.has(course.skill_id)) {
        console.log(`[course-orchestrator] Skipping duplicate for skill ${course.skill_id}`);
        continue;
      }

      const priority = course.priority === 'must' ? 'must' : 'suggested';

      // Insert curriculum
      const { data: currData, error: currErr } = await supabase
        .from('learning_curricula')
        .insert({
          user_id,
          title: course.title || "Course",
          title_en: course.title_en,
          description: course.description,
          topic: course.topic || "General",
          category: course.category || "personal_growth",
          estimated_days: course.estimated_days || 30,
          pillar: course.pillar,
          skill_id: course.skill_id || null,
          course_priority: priority,
          generated_by: 'orchestrator',
          status: "active",
          curriculum_data: course,
          total_modules: course.modules?.length || 0,
          plan_id: plan_ids?.[0] || null,
        })
        .select("id")
        .single();

      if (currErr || !currData) {
        console.error("[course-orchestrator] Curriculum insert error:", currErr);
        continue;
      }

      const curriculumDbId = currData.id;
      let totalLessons = 0;

      // Insert modules and lessons
      for (let mi = 0; mi < (course.modules || []).length; mi++) {
        const mod = course.modules[mi];
        const { data: modData, error: modErr } = await supabase
          .from('learning_modules')
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

        if (modErr || !modData) { console.error("Module error:", modErr); continue; }

        for (let li = 0; li < (mod.lessons || []).length; li++) {
          const lesson = mod.lessons[li];
          await supabase.from('learning_lessons').insert({
            module_id: modData.id,
            curriculum_id: curriculumDbId,
            user_id,
            title: lesson.title,
            title_en: lesson.title_en,
            lesson_type: lesson.lesson_type || "theory",
            order_index: li,
            status: mi === 0 && li === 0 ? "active" : "locked",
            content: {},
            xp_reward: lesson.xp_reward || 10,
            time_estimate_minutes: lesson.time_estimate_minutes || 8,
          });
          totalLessons++;
        }
      }

      await supabase.from('learning_curricula')
        .update({ total_lessons: totalLessons })
        .eq('id', curriculumDbId);

      // 8. For "must" courses: inject daily learning tasks into action_items
      if (priority === 'must') {
        totalMustCourses++;
        
        // Get the first active lesson to create an initial learning task
        const { data: firstLesson } = await supabase
          .from('learning_lessons')
          .select('id, title, title_en, time_estimate_minutes')
          .eq('curriculum_id', curriculumDbId)
          .eq('status', 'active')
          .order('order_index')
          .limit(1)
          .single();

        if (firstLesson) {
          await supabase.from('action_items').insert({
            user_id,
            type: 'task',
            source: 'learn',
            status: 'todo',
            title: `📚 ${firstLesson.title}`,
            description: course.description,
            pillar: course.pillar || 'focus',
            xp_reward: 15,
            time_block: 'learning',
            metadata: {
              curriculum_id: curriculumDbId,
              lesson_id: firstLesson.id,
              course_title: course.title,
              course_priority: 'must',
              time_estimate_minutes: firstLesson.time_estimate_minutes || 8,
              is_learning_task: true,
            },
          });
        }
      }

      savedCourses.push({
        id: curriculumDbId,
        title: course.title,
        priority,
        skill_id: course.skill_id,
        pillar: course.pillar,
        total_lessons: totalLessons,
      });

      existingSkillIds.add(course.skill_id);
    }

    console.log(`[course-orchestrator] ✅ Saved ${savedCourses.length} courses (${totalMustCourses} must)`);

    return new Response(JSON.stringify({
      success: true,
      courses: savedCourses,
      must_count: totalMustCourses,
      suggested_count: savedCourses.length - totalMustCourses,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("[course-orchestrator] Error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
