import OpenAI from 'openai';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient, createAuthSupabaseClient } from '../../src/lib/tools/supabaseQuery.js';
import { getStoryScenePreset, type StoryScene, type StoryTheme } from '../../src/lib/storyWorld.js';

function hashPayload(input: Record<string, unknown>) {
  return createHash('sha1').update(JSON.stringify(input)).digest('hex');
}

async function resolveUserIdFromAuth(authHeader?: string | null) {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const supabase = createAuthSupabaseClient();
    const { data } = await supabase.auth.getUser(token);
    return data.user?.id || null;
  } catch {
    return null;
  }
}

async function buildStoryProfile(userId: string | null, language: 'he' | 'en') {
  if (!userId) {
    return {
      archetype: 'guardian',
      language,
      pillars: [] as string[],
      planTitle: null as string | null,
      intention: null as string | null,
      displayName: language === 'he' ? 'Traveler' : 'Traveler',
    };
  }

  const supabase = createAdminSupabaseClient();
  const [profileRes, launchpadRes, planRes, domainsRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    supabase
      .from('launchpad_progress')
      .select('step_1_intention, step_2_profile_data')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('life_plans')
      .select('plan_data')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('life_domains').select('domain_id, status').eq('user_id', userId),
  ]);

  const launchpad = (launchpadRes.data?.step_2_profile_data || {}) as Record<string, unknown>;
  const intention = (launchpadRes.data?.step_1_intention || {}) as Record<string, unknown>;
  const archetype =
    typeof launchpad.dominant_archetype === 'string'
      ? launchpad.dominant_archetype
      : typeof launchpad.identity_archetype === 'string'
        ? launchpad.identity_archetype
        : 'guardian';
  const pillars = (domainsRes.data || [])
    .filter((item) => item.status === 'configured' || item.status === 'active')
    .map((item) => item.domain_id);

  const planData = (planRes.data?.plan_data || {}) as Record<string, unknown>;

  return {
    archetype,
    language,
    pillars,
    planTitle:
      typeof planData.title === 'string'
        ? planData.title
        : typeof planData.plan_title === 'string'
          ? planData.plan_title
          : null,
    intention:
      typeof intention.target_90_days === 'string'
        ? intention.target_90_days
        : typeof launchpad.target_90_days === 'string'
          ? launchpad.target_90_days
          : null,
    displayName: profileRes.data?.full_name || 'Traveler',
  };
}

function themeFromSceneType(sceneType: string): StoryTheme {
  switch (sceneType) {
    case 'fm':
      return {
        accent: '#f59e0b',
        secondary: '#22c55e',
        glow: 'rgba(245,158,11,0.30)',
        overlay: 'rgba(20, 10, 3, 0.68)',
      };
    case 'community':
      return {
        accent: '#10b981',
        secondary: '#06b6d4',
        glow: 'rgba(16,185,129,0.30)',
        overlay: 'rgba(3, 18, 15, 0.70)',
      };
    case 'study':
      return {
        accent: '#8b5cf6',
        secondary: '#ec4899',
        glow: 'rgba(139,92,246,0.34)',
        overlay: 'rgba(15, 8, 26, 0.72)',
      };
    case 'ceremony':
      return {
        accent: '#a855f7',
        secondary: '#22d3ee',
        glow: 'rgba(168,85,247,0.35)',
        overlay: 'rgba(7, 6, 22, 0.74)',
      };
    default:
      return {
        accent: '#22d3ee',
        secondary: '#6366f1',
        glow: 'rgba(34,211,238,0.30)',
        overlay: 'rgba(5, 10, 24, 0.72)',
      };
  }
}

async function generateCopy(params: {
  sceneType: string;
  phase: string;
  language: 'he' | 'en';
  profile: Awaited<ReturnType<typeof buildStoryProfile>>;
}) {
  const fallback = getStoryScenePreset(params.sceneType);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fallback;

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    });

    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL_STORY_SCENE || 'openrouter/quasr/qwen-2.5-7b-instruct',
      temperature: 0.7,
      max_tokens: 220,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            params.language === 'he'
              ? 'Return JSON with headline, body, chapter_key in Hebrew. Keep it cinematic, personal, and concise.'
              : 'Return JSON with headline, body, chapter_key. Tone must be cinematic, sharp, personal, short, and not marketing copy.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            sceneType: params.sceneType,
            phase: params.phase,
            archetype: params.profile.archetype,
            pillars: params.profile.pillars,
            planTitle: params.profile.planTitle,
            intention: params.profile.intention,
            displayName: params.profile.displayName,
            fallbackHeadline: fallback.headline,
            fallbackBody: fallback.body,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallback;

    const parsed = JSON.parse(content) as {
      headline?: string;
      body?: string;
      chapter_key?: string;
    };

    return {
      ...fallback,
      headline: parsed.headline || fallback.headline,
      body: parsed.body || fallback.body,
      chapterKey: parsed.chapter_key || fallback.chapterKey,
      theme: themeFromSceneType(params.sceneType),
    };
  } catch (error) {
    console.error('[story] copy generation failed', error);
    return fallback;
  }
}

async function generateImage(params: {
  prompt: string;
  sceneType: string;
}) {
  const preset = getStoryScenePreset(params.sceneType);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return preset.imageUrl;

  try {
    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL_STORY_IMAGE || 'openrouter/free',
          modalities: ['image', 'text'],
          messages: [
            {
              role: 'user',
              content: params.prompt,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`OpenRouter image request failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          images?: Array<{
            image_url?: {
              url?: string;
            };
          }>;
        };
      }>;
    };

    return payload.choices?.[0]?.message?.images?.[0]?.image_url?.url || preset.imageUrl;
  } catch (error) {
    console.error('[story] image generation failed', error);
    return preset.imageUrl;
  }
}

async function buildImagePrompt(params: {
  sceneType: string;
  language: 'he' | 'en';
  headline: string;
  body: string;
  profile: Awaited<ReturnType<typeof buildStoryProfile>>;
  context?: Record<string, unknown>;
}) {
  const realmHint =
    typeof params.context?.realmId === 'string'
      ? params.context.realmId
      : typeof params.context?.realm === 'string'
        ? params.context.realm
        : params.sceneType;

  if (params.language === 'he') {
    return [
      'צרו פריים קולנועי רחב לעולם החיים של Evolve.',
      `סוג סצנה: ${params.sceneType}.`,
      `מרחב: ${realmHint}.`,
      `כותרת: ${params.headline}.`,
      `ארכיטיפ דומיננטי: ${params.profile.archetype}.`,
      `הקשר נרטיבי: ${params.body}.`,
      'עולם מיסטי עתידני עם נוכחות של AION, אנרגיית אווטאר, עומק שכבות, תאורה דרמטית ואווירה יוקרתית.',
      'ללא טקסט, ללא כתוביות, ללא רכיבי ממשק בתוך התמונה.',
    ].join(' ');
  }

  return [
    'Create a cinematic widescreen scene for the Evolve life-world.',
    `Scene type: ${params.sceneType}.`,
    `Realm or area: ${realmHint}.`,
    `Headline: ${params.headline}.`,
    `Dominant archetype: ${params.profile.archetype}.`,
    `Narrative context: ${params.body}.`,
    'Show a premium AI-mystic game world with AION presence, subtle avatar energy, dramatic lighting, layered depth, and strong atmosphere.',
    'No text, no captions, no UI labels inside the image.',
  ].join(' ');
}

export async function generateStoryScene(params: {
  authHeader?: string | null;
  sceneType: string;
  phase: string;
  language: 'he' | 'en';
  userId?: string | null;
  context?: Record<string, unknown>;
  seedReference?: string | null;
}): Promise<StoryScene> {
  const resolvedUserId = params.userId || (await resolveUserIdFromAuth(params.authHeader));
  const cacheKey = hashPayload({
    userId: resolvedUserId,
    sceneType: params.sceneType,
    phase: params.phase,
    language: params.language,
    context: params.context || {},
    seedReference: params.seedReference || null,
  });

  const supabase = createAdminSupabaseClient();
  const cached = await supabase
    .from('user_story_scenes')
    .select('scene_id, chapter_key, scene_type, headline, body, image_url, theme, ambient_props, cache_key')
    .eq('cache_key', cacheKey)
    .maybeSingle();

  if (cached.data?.scene_id) {
    return {
      sceneId: cached.data.scene_id,
      chapterKey: cached.data.chapter_key,
      sceneType: cached.data.scene_type,
      headline: cached.data.headline,
      body: cached.data.body,
      imageUrl: cached.data.image_url,
      cacheHit: true,
      theme: (cached.data.theme || themeFromSceneType(params.sceneType)) as StoryTheme,
      ambientProps: (cached.data.ambient_props || {}) as Record<string, unknown>,
    };
  }

  const profile = await buildStoryProfile(resolvedUserId, params.language);
  const baseScene = await generateCopy({
    sceneType: params.sceneType,
    phase: params.phase,
    language: params.language,
    profile,
  });

  const imagePrompt = await buildImagePrompt({
    sceneType: params.sceneType,
    language: params.language,
    headline: baseScene.headline,
    body: baseScene.body,
    profile,
    context: params.context || {},
  });

  const imageUrl = await generateImage({
    prompt: imagePrompt,
    sceneType: params.sceneType,
  });

  const scene: StoryScene = {
    ...baseScene,
    sceneId: `${params.sceneType}:${cacheKey}`,
    imageUrl,
    cacheHit: false,
    theme: themeFromSceneType(params.sceneType),
  };

  if (resolvedUserId) {
    await supabase.from('user_story_profiles').upsert(
      {
        user_id: resolvedUserId,
        current_chapter: scene.chapterKey,
        language: params.language,
        theme_params: scene.theme,
        identity_summary: {
          archetype: profile.archetype,
          pillars: profile.pillars,
          plan_title: profile.planTitle,
          intention: profile.intention,
        },
        last_scene_type: params.sceneType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    await supabase.from('user_story_scenes').upsert(
      {
        user_id: resolvedUserId,
        scene_id: scene.sceneId,
        chapter_key: scene.chapterKey,
        scene_type: scene.sceneType,
        headline: scene.headline,
        body: scene.body,
        image_url: scene.imageUrl,
        theme: scene.theme,
        ambient_props: scene.ambientProps || {},
        personalization_source: {
          phase: params.phase,
          context: params.context || {},
        },
        cache_key: cacheKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'scene_id' },
    );
  }

  return scene;
}
