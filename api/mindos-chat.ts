import type { VercelRequest, VercelResponse } from '@vercel/node';
import { streamAuroraAgent } from './_lib/agent-runtime.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await streamAuroraAgent(req, res);
}
