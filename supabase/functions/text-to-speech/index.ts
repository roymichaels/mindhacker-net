import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreFlight, isCorsPreFlight } from "../_shared/cors.ts";
import { jsonResponse, badRequestResponse, errorResponse } from "../_shared/responses.ts";
import { logError } from "../_shared/errorHandling.ts";

interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

// This edge function is a fallback that signals the client to use browser TTS
// Since Lovable AI Gateway doesn't support audio/TTS models, we return a fallback signal
// The primary TTS is handled by ElevenLabs, this is just a secondary fallback path
serve(async (req) => {
  if (isCorsPreFlight(req)) {
    return handleCorsPreFlight();
  }

  try {
    const body: TTSRequest = await req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return badRequestResponse('Text is required');
    }

    console.log('[TTS] Fallback request - signaling browser TTS:', { textLength: text.length });

    // Since Lovable Gateway doesn't support TTS models (tts-1, etc.),
    // we signal the client to use browser's built-in speechSynthesis
    return jsonResponse({ 
      fallback: true,
      message: 'Use browser TTS - OpenAI TTS not available via Gateway',
    });

  } catch (error) {
    const errorId = logError('text-to-speech', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500,
      { fallback: true, errorId }
    );
  }
});