import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CacheRequest {
  userId: string;
  cacheKey: string;
  fullScript: string;
  language?: 'he' | 'en';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, cacheKey, fullScript, language = 'he' } = await req.json() as CacheRequest;

    if (!userId || !cacheKey || !fullScript?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, cacheKey, fullScript' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for storage operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Voice selection based on language
    const voiceId = language === 'he' ? 'cgSgspJ2msm6clMCkdW9' : 'EXAVITQu4vr4xnSDxMaL';

    console.log(`Generating continuous audio for cache: ${cacheKey}, script length: ${fullScript.length} chars`);

    // Generate single continuous audio via ElevenLabs
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: fullScript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      console.error('ElevenLabs error:', error);
      return new Response(
        JSON.stringify({ error: `TTS generation failed: ${error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audio as buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    
    // Sanitize the cache key for storage path (remove special chars, Hebrew, etc.)
    const safeCacheKey = cacheKey
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 100);
    
    const audioPath = `${userId}/${safeCacheKey}/full_session.mp3`;
    
    console.log(`Saving audio to path: ${audioPath} (${audioBuffer.byteLength} bytes)`);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('hypnosis-cache')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Audio cached successfully: ${audioPath}`);

    // Update cache table with single audio URL
    const { error: updateError } = await supabase
      .from('hypnosis_script_cache')
      .update({ 
        audio_url: audioPath,
        last_used_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('cache_key', cacheKey);

    if (updateError) {
      console.error('Failed to update cache with audio path:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioPath,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cache audio';
    console.error('Cache audio error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
