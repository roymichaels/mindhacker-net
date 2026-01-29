import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'ElevenLabs not configured',
        fallback: true,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve voice ID from name or use as-is
    const resolvedVoiceId = VOICE_MAP[voiceId.toLowerCase()] || voiceId;

    // Limit text length
    const maxLength = 5000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    console.log('ElevenLabs TTS request:', { 
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
      console.error('ElevenLabs TTS error:', response.status, errorText);

      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Invalid API key',
          fallback: true,
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          fallback: true,
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        error: `ElevenLabs TTS failed: ${response.status}`,
        fallback: true,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the audio directly
    const audioBuffer = await response.arrayBuffer();
    
    console.log('ElevenLabs TTS success:', { audioSize: audioBuffer.byteLength });

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
