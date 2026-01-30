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

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { language = 'he' } = await req.json();

    // Fetch user's recent form analyses (from Introspection and Life Plan)
    const { data: analyses } = await supabase
      .from('form_analyses')
      .select(`
        analysis_summary,
        patterns,
        recommendation,
        transformation_potential,
        form_submission:form_submission_id (
          form_id,
          responses
        )
      `)
      .order('created_at', { ascending: false })
      .limit(2);

    // Fetch life direction if available
    const { data: lifeDirection } = await supabase
      .from('aurora_life_direction')
      .select('content, clarity_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch life visions if available
    const { data: lifeVisions } = await supabase
      .from('aurora_life_visions')
      .select('title, description, focus_areas')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Build context for AI
    let userContext = '';
    
    if (analyses && analyses.length > 0) {
      userContext += 'ניתוח אישי של המשתמש:\n';
      for (const analysis of analyses) {
        if (analysis.analysis_summary) {
          userContext += `- ${analysis.analysis_summary}\n`;
        }
        if (analysis.patterns) {
          userContext += `- דפוסים: ${JSON.stringify(analysis.patterns)}\n`;
        }
        if (analysis.recommendation) {
          userContext += `- המלצה: ${analysis.recommendation}\n`;
        }
      }
    }

    if (lifeDirection?.content) {
      userContext += `\nכיוון חיים: ${lifeDirection.content}\n`;
    }

    if (lifeVisions && lifeVisions.length > 0) {
      const vision = lifeVisions[0];
      userContext += `\nחזון: ${vision.title}`;
      if (vision.description) userContext += ` - ${vision.description}`;
      if (vision.focus_areas) userContext += `\nתחומי מיקוד: ${vision.focus_areas.join(', ')}`;
    }

    console.log('User context for AI:', userContext);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = language === 'he' 
      ? `אתה מאמן חיים שעוזר למשתמשים להתחיל את השבוע הראשון שלהם בשינוי.
בהתבסס על המידע האישי של המשתמש, צור הצעות מותאמות אישית.

חוקים:
- כל פעולה חייבת להיות קטנה, ספציפית וברת ביצוע תוך 5-20 דקות
- הפעולות צריכות להיות קשורות למה שהמשתמש שיתף
- הרגל עוגן חייב להיות כל כך קטן שאי אפשר לא לעשות אותו (30 שניות - 2 דקות)
- השתמש באימוג'י אחד לכל הצעה
- הישאר חיובי ומעודד`
      : `You are a life coach helping users start their first week of change.
Based on the user's personal information, create personalized suggestions.

Rules:
- Each action must be small, specific and achievable in 5-20 minutes
- Actions should relate to what the user shared
- Anchor habit must be so tiny it's impossible not to do (30 sec - 2 min)
- Use one emoji per suggestion
- Stay positive and encouraging`;

    const userPrompt = language === 'he'
      ? `הנה המידע על המשתמש:
${userContext || 'אין מידע ספציפי עדיין - תן הצעות כלליות טובות'}

צור בדיוק:
1. 8 הצעות לפעולות שבועיות (קטנות וספציפיות)
2. 5 הצעות להרגל עוגן יומי (קטן במיוחד)

החזר JSON בפורמט הבא בלבד:`
      : `Here is the user information:
${userContext || 'No specific information yet - give good general suggestions'}

Create exactly:
1. 8 weekly action suggestions (small and specific)
2. 5 daily anchor habit suggestions (super tiny)

Return JSON in this format only:`;

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
            name: 'return_suggestions',
            description: 'Return personalized action and anchor habit suggestions',
            parameters: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      icon: { type: 'string', description: 'Single emoji' },
                      label: { type: 'string', description: 'Hebrew label' },
                      labelEn: { type: 'string', description: 'English label' }
                    },
                    required: ['id', 'icon', 'label', 'labelEn']
                  },
                  minItems: 8,
                  maxItems: 8
                },
                anchors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      icon: { type: 'string', description: 'Single emoji' },
                      label: { type: 'string', description: 'Hebrew label' },
                      labelEn: { type: 'string', description: 'English label' }
                    },
                    required: ['id', 'icon', 'label', 'labelEn']
                  },
                  minItems: 5,
                  maxItems: 5
                }
              },
              required: ['actions', 'anchors']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'return_suggestions' } }
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
    console.log('AI Response:', JSON.stringify(aiResponse));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No tool call response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify(suggestions), {
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
