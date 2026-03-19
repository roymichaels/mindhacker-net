import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { jsonResponse, badRequestResponse, audioResponse } from "../_shared/responses.ts";
import { logError } from "../_shared/errorHandling.ts";
import { requireAuth } from "../_shared/auth.ts";

interface ElevenLabsTTSRequest {
  text: string;
  voiceId?: string;
  speed?: number;
}

// Top ElevenLabs voice IDs
const VOICE_MAP: Record<string, string> = {
  'jessica': 'cgSgspJ2msm6clMCkdW9',    // Jessica — default, multilingual
  'sarah': 'EXAVITQu4vr4xnSDxMaL',
  'roger': 'CwhRBWXzGAHq8TQ4Fs17',
  'laura': 'FGY2WhTYpPnrIDTdsKH5',
  'charlie': 'IKne3meq5aSn9XLyUdCD',
  'matilda': 'XrExE9yKIg1WjnnlVkGX',
  'lily': 'pFZP5JQG7iQjIQuC4Bku',
  'brian': 'nPczCjzI2devNBz1zQrb',
  'daniel': 'onwK4e9ZLuTAKqWW03F9',
};

const ELEVENLABS_MODEL_ID = 'eleven_v3';

serve(async (req) => {
  if (isCorsPreFlight(req)) {
    return handleCorsPreFlight();
  }

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const body: ElevenLabsTTSRequest = await req.json();
    const {
      text,
      voiceId = 'jessica',
      speed = 1.0,
    } = body;

    if (!text || text.trim().length === 0) {
      return badRequestResponse('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('[ElevenLabs] API key not configured');
      return jsonResponse({
        error: 'ElevenLabs not configured',
        fallback: true,
      }, 500);
    }

    // Resolve voice ID from name or use as-is
    const resolvedVoiceId = VOICE_MAP[voiceId.toLowerCase()] || voiceId;

    // Limit text length
    const maxLength = 5000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    // Detect if text contains Hebrew
    const hasHebrew = /[\u0590-\u05FF]/.test(truncatedText);

    console.log('[ElevenLabs] TTS request:', {
      textLength: truncatedText.length,
      voice: resolvedVoiceId,
      model: ELEVENLABS_MODEL_ID,
      language: hasHebrew ? 'he' : 'en',
    });

    // Keep payload clean: model + language + optional speed only
    const ttsPayload: Record<string, unknown> = {
      text: truncatedText,
      model_id: ELEVENLABS_MODEL_ID,
      language_code: hasHebrew ? 'he' : 'en',
    };

    if (speed !== 1.0) {
      ttsPayload.voice_settings = { speed };
    }

    // IMPORTANT: output_format must be in query params, NOT body
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30000);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ttsPayload),
        signal: abortController.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs] TTS error:', response.status, errorText);

      let parsed: any = null;
      try {
        parsed = JSON.parse(errorText);
      } catch {
        // ignore parse errors
      }

      const detailStatus = parsed?.detail?.status;
      const detailMessage = parsed?.detail?.message;

      if (detailStatus === 'quota_exceeded') {
        return jsonResponse({
          error: 'Quota exceeded',
          message: detailMessage || 'Your ElevenLabs quota is exceeded.',
          fallback: true,
        }, 402);
      }

      if (response.status === 401) {
        return jsonResponse({
          error: 'Unauthorized',
          message: 'ElevenLabs rejected the request (check API key permissions).',
          fallback: true,
        }, 401);
      }

      if (response.status === 429) {
        return jsonResponse({
          error: 'Rate limit exceeded',
          fallback: true,
        }, 429);
      }

      return jsonResponse({
        error: `ElevenLabs TTS failed: ${response.status}`,
        message: detailMessage || errorText,
        fallback: true,
      }, 500);
    }

    const audioBuffer = await response.arrayBuffer();

    console.log('[ElevenLabs] TTS success:', { audioSize: audioBuffer.byteLength });

    return audioResponse(audioBuffer);

  } catch (error) {
    const errorId = logError('elevenlabs-tts', error);
    return jsonResponse({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
      errorId,
    }, 500);
  }
});
