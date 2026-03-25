import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStoryScene } from '../_lib/story-engine.js';

function parseBody(body: unknown) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = parseBody(req.body);
    const scene = await generateStoryScene({
      authHeader: req.headers.authorization,
      sceneType: typeof body.scene_type === 'string' ? body.scene_type : 'mindos',
      phase: typeof body.phase === 'string' ? body.phase : 'world',
      language: body.language === 'he' ? 'he' : 'en',
      userId: typeof body.user_id === 'string' ? body.user_id : null,
      context: typeof body.context === 'object' && body.context ? (body.context as Record<string, unknown>) : {},
      seedReference: typeof body.seed_reference === 'string' ? body.seed_reference : null,
    });

    return res.status(200).json(scene);
  } catch (error) {
    console.error('[story] scene route error', error);
    return res.status(500).json({ error: 'Failed to generate scene' });
  }
}
