import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Segment {
  id: string;
  text: string;
  mood: string;
  durationPercent: number;
}

interface CacheRequest {
  userId: string;
  cacheKey: string;
  segments: Segment[];
  language?: 'he' | 'en';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, cacheKey, segments, language = 'he' } = await req.json() as CacheRequest;

    if (!userId || !cacheKey || !segments?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, cacheKey, segments' }),
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
    const voiceId = language === 'he' ? 'cgSgspJ2msm6clMCkdW9' : 'EXAVITQu4vr4xnSDxMaL'; // Sarah for Hebrew, Bella for English

    const audioPaths: string[] = [];
    const errors: string[] = [];

    // Process segments sequentially to avoid rate limiting
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      if (!segment.text?.trim()) {
        console.warn(`Segment ${i} has no text, skipping`);
        audioPaths.push('');
        continue;
      }

      try {
        // Generate audio via ElevenLabs
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenlabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: segment.text,
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
          console.error(`ElevenLabs error for segment ${i}:`, error);
          errors.push(`Segment ${i}: ${error}`);
          audioPaths.push('');
          continue;
        }

        // Get audio as buffer
        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioPath = `${userId}/${cacheKey}/segment_${i}.mp3`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('hypnosis-cache')
          .upload(audioPath, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Storage upload error for segment ${i}:`, uploadError);
          errors.push(`Segment ${i} upload: ${uploadError.message}`);
          audioPaths.push('');
          continue;
        }

        audioPaths.push(audioPath);
        console.log(`Segment ${i} cached successfully: ${audioPath}`);

        // Small delay to avoid rate limiting
        if (i < segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (segmentError: unknown) {
        const errorMessage = segmentError instanceof Error ? segmentError.message : 'Unknown error';
        console.error(`Error processing segment ${i}:`, segmentError);
        errors.push(`Segment ${i}: ${errorMessage}`);
        audioPaths.push('');
      }
    }

    // Update cache table with audio paths
    const { error: updateError } = await supabase
      .from('hypnosis_script_cache')
      .update({ 
        audio_paths: audioPaths,
        last_used_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('cache_key', cacheKey);

    if (updateError) {
      console.error('Failed to update cache with audio paths:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioPaths,
        errors: errors.length > 0 ? errors : undefined,
        cached: audioPaths.filter(p => p).length,
        total: segments.length,
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
