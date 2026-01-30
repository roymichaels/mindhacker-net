import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { language = 'he', careerStatus = '', careerGoal = '' } = await req.json();

    // Fetch user context from analyses and life direction
    const { data: analyses } = await supabase
      .from('form_analyses')
      .select('analysis_summary, patterns, recommendation')
      .order('created_at', { ascending: false })
      .limit(2);

    const { data: lifeDirection } = await supabase
      .from('aurora_life_direction')
      .select('content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: lifeVisions } = await supabase
      .from('aurora_life_visions')
      .select('title, description, focus_areas')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Build context
    let userContext = '';
    
    if (analyses && analyses.length > 0) {
      userContext += 'ניתוח אישי:\n';
      for (const a of analyses) {
        if (a.analysis_summary) userContext += `- ${a.analysis_summary}\n`;
        if (a.recommendation) userContext += `- המלצה: ${a.recommendation}\n`;
      }
    }

    if (lifeDirection?.content) {
      userContext += `\nכיוון חיים: ${lifeDirection.content}\n`;
    }

    if (lifeVisions?.[0]) {
      const v = lifeVisions[0];
      userContext += `\nחזון: ${v.title}`;
      if (v.focus_areas) userContext += ` | מיקוד: ${v.focus_areas.join(', ')}`;
    }

    if (careerStatus) {
      userContext += `\n\nמצב תעסוקתי נוכחי: ${careerStatus}`;
    }
    if (careerGoal) {
      userContext += `\nמטרה מקצועית: ${careerGoal}`;
    }

    console.log('User context for transformation plan:', userContext);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = language === 'he' 
      ? `אתה מאמן אליטה שעוזר לאנשים להפוך לגרסה הטובה ביותר של עצמם.

אתה לא מציע "טיפים קטנים" או "5 דקות של משהו". אתה מציע צעדים אמיתיים שמזיזים את האדם קדימה.

המטרה: להפוך אנשים רגילים לאליטה שבונה עסקים ומובילה את חייה.

חוקים:
- צעדים קונקרטיים ואמיתיים, לא "רעיונות"
- אין פעולות של "5 דקות" - זה לא בונה אליטה
- התמקד בקריירה, עסקים, והפיכה למוביל
- כל צעד צריך להיות משהו שאפשר לעשות השבוע
- משימות אתגר צריכות להיות מפחידות אבל אפשריות`
      : `You are an elite coach helping people become the best version of themselves.

You don't suggest "small tips" or "5 minutes of something". You suggest real steps that move people forward.

Goal: Turn regular people into elite business builders and life leaders.

Rules:
- Concrete, real steps - not "ideas"
- No "5 minute" actions - that doesn't build elite
- Focus on career, business, and becoming a leader
- Each step should be doable this week
- Challenge missions should be scary but possible`;

    const userPrompt = language === 'he'
      ? `הנה המידע על המשתמש:
${userContext || 'אין מידע ספציפי - תן הצעות כלליות חזקות'}

צור:
1. 5 צעדים קונקרטיים לקריירה/עסקים השבוע (מותאמים למטרה)
2. 5 משימות אתגר (דברים שמפחידים אבל מזיזים קדימה)

כל צעד צריך להיות:
- ספציפי ובר ביצוע
- משמעותי (לא "שתה מים")
- קשור למטרה המקצועית
- משהו שבאמת יזיז את האדם קדימה

דוגמאות טובות:
✅ "שלח 10 הודעות לאנשים בתעשייה שלך"
✅ "צור תוכן אחד שמציג את המומחיות שלך"
✅ "התקשר ללקוח פוטנציאלי ותציע שירות"
✅ "הרשם לקורס מקצועי והתחל ללמוד"

דוגמאות רעות:
❌ "צפה ב-5 דקות של סרטון"
❌ "שתה כוס מים"
❌ "חשוב על משהו טוב"`
      : `Here is the user information:
${userContext || 'No specific info - give strong general suggestions'}

Create:
1. 5 concrete career/business steps for this week (tailored to goal)
2. 5 challenge missions (scary but moving forward)

Each step should be:
- Specific and actionable
- Meaningful (not "drink water")
- Related to professional goal
- Something that actually moves the person forward

Good examples:
✅ "Send 10 messages to people in your industry"
✅ "Create one piece of content showcasing expertise"
✅ "Call a potential client and offer your service"
✅ "Sign up for a professional course and start learning"

Bad examples:
❌ "Watch a 5-minute video"
❌ "Drink a glass of water"
❌ "Think about something good"`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'return_transformation_plan',
            description: 'Return personalized career steps and challenge missions for elite transformation',
            parameters: {
              type: 'object',
              properties: {
                career_steps: {
                  type: 'array',
                  description: 'Concrete career/business steps for this week',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      icon: { type: 'string', description: 'Single relevant emoji' },
                      label: { type: 'string', description: 'Hebrew action' },
                      labelEn: { type: 'string', description: 'English action' }
                    },
                    required: ['id', 'icon', 'label', 'labelEn']
                  },
                  minItems: 5,
                  maxItems: 5
                },
                challenge_missions: {
                  type: 'array',
                  description: 'Scary but impactful challenge missions',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      icon: { type: 'string', description: 'Single powerful emoji' },
                      label: { type: 'string', description: 'Hebrew challenge' },
                      labelEn: { type: 'string', description: 'English challenge' }
                    },
                    required: ['id', 'icon', 'label', 'labelEn']
                  },
                  minItems: 5,
                  maxItems: 5
                }
              },
              required: ['career_steps', 'challenge_missions']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'return_transformation_plan' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI request failed');
    }

    const aiResponse = await response.json();
    console.log('AI Transformation Response:', JSON.stringify(aiResponse));

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No tool call response');
    }

    const plan = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
