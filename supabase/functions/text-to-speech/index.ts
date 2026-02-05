import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

// This edge function is a fallback that signals the client to use browser TTS
// Since Lovable AI Gateway doesn't support audio/TTS models, we return a fallback signal
// The primary TTS is handled by ElevenLabs, this is just a secondary fallback path
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TTSRequest = await req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('TTS fallback request - signaling browser TTS:', { textLength: text.length });

    // Since Lovable Gateway doesn't support TTS models (tts-1, etc.),
    // we signal the client to use browser's built-in speechSynthesis
    return new Response(JSON.stringify({ 
      fallback: true,
      message: 'Use browser TTS - OpenAI TTS not available via Gateway',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('TTS error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});