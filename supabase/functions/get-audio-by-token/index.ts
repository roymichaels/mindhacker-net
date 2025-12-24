import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    
    if (!token || typeof token !== 'string') {
      console.log('Invalid token provided');
      return new Response(
        JSON.stringify({ error: 'קישור לא תקין' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching audio for token: ${token.substring(0, 8)}...`);

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the access token and get audio data
    const { data: access, error: accessError } = await supabase
      .from('user_audio_access')
      .select(`
        is_active,
        expires_at,
        hypnosis_audios (
          title,
          description,
          file_path,
          duration_seconds
        )
      `)
      .eq('access_token', token)
      .maybeSingle();

    if (accessError) {
      console.error('Database error:', accessError);
      return new Response(
        JSON.stringify({ error: 'שגיאה בטעינת ההקלטה' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!access) {
      console.log('Token not found');
      return new Response(
        JSON.stringify({ error: 'הקישור לא נמצא או שפג תוקפו' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!access.is_active) {
      console.log('Access is inactive');
      return new Response(
        JSON.stringify({ error: 'הגישה להקלטה זו הושבתה' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      console.log('Access expired');
      return new Response(
        JSON.stringify({ error: 'פג תוקף הגישה להקלטה זו' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // hypnosis_audios can be an object or null from the join
    const audioData = access.hypnosis_audios as unknown as {
      title: string;
      description: string | null;
      file_path: string;
      duration_seconds: number | null;
    } | null;

    if (!audioData || !audioData.file_path) {
      console.error('Audio data missing');
      return new Response(
        JSON.stringify({ error: 'לא נמצאו נתוני הקלטה' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed URL for the audio file (1 hour expiry)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from('hypnosis-audios')
      .createSignedUrl(audioData.file_path, 3600);

    if (signedError || !signedUrlData) {
      console.error('Signed URL error:', signedError);
      return new Response(
        JSON.stringify({ error: 'שגיאה בטעינת קובץ האודיו' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated signed URL for audio: ${audioData.title}`);

    return new Response(
      JSON.stringify({
        title: audioData.title,
        description: audioData.description,
        duration_seconds: audioData.duration_seconds,
        audio_url: signedUrlData.signedUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'שגיאה בשרת' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
