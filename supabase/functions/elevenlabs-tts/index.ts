import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { jsonResponse, badRequestResponse, audioResponse } from "../_shared/responses.ts";
import { logError } from "../_shared/errorHandling.ts";

interface ElevenLabsTTSRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
}

// Top ElevenLabs voice IDs
const VOICE_MAP: Record<string, string> = {
  'sarah': 'EXAVITQu4vr4xnSDxMaL',      // Warm female
  'roger': 'CwhRBWXzGAHq8TQ4Fs17',      // Professional male
  'laura': 'FGY2WhTYpPnrIDTdsKH5',      // Calm female  
  'charlie': 'IKne3meq5aSn9XLyUdCD',    // Friendly male
  'matilda': 'XrExE9yKIg1WjnnlVkGX',    // Soothing female
  'lily': 'pFZP5JQG7iQjIQuC4Bku',       // Gentle female
  'brian': 'nPczCjzI2devNBz1zQrb',      // Deep male
  'daniel': 'onwK4e9ZLuTAKqWW03F9',     // Clear male
};

serve(async (req) => {
  if (isCorsPreFlight(req)) {
    return handleCorsPreFlight();
  }

  try {
    const body: ElevenLabsTTSRequest = await req.json();
    const { 
      text, 
      voiceId = 'sarah',
      modelId = 'eleven_v3',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0.5,
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

    console.log('[ElevenLabs] TTS request:', { 
      textLength: truncatedText.length, 
      voice: resolvedVoiceId,
      model: modelId,
    });

    // IMPORTANT: output_format must be in query params, NOT body
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true,
            speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs] TTS error:', response.status, errorText);

      // Try to parse ElevenLabs error payload (often JSON)
      let parsed: any = null;
      try {
        parsed = JSON.parse(errorText);
      } catch {
        // ignore parse errors
      }

      const detailStatus = parsed?.detail?.status;
      const detailMessage = parsed?.detail?.message;

      // ElevenLabs may return 401 for quota issues in some cases.
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

    // Return the audio directly
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
