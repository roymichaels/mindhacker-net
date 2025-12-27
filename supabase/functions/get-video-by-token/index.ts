import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "קישור לא תקין" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the video access record by token
    const { data: accessRecord, error: accessError } = await supabase
      .from("user_video_access")
      .select(`
        id,
        is_active,
        expires_at,
        video_id,
        hypnosis_videos (
          id,
          title,
          description,
          file_path,
          duration_seconds
        )
      `)
      .eq("access_token", token)
      .maybeSingle();

    if (accessError) {
      console.error("Error fetching access record:", accessError);
      return new Response(
        JSON.stringify({ error: "שגיאה בטעינת הסרטון" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!accessRecord) {
      return new Response(
        JSON.stringify({ error: "קישור לא תקין או שפג תוקפו" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if access is active
    if (!accessRecord.is_active) {
      return new Response(
        JSON.stringify({ error: "הגישה לסרטון הושבתה" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if access has expired
    if (accessRecord.expires_at && new Date(accessRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "הגישה לסרטון פגה" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const video = accessRecord.hypnosis_videos as any;
    if (!video) {
      return new Response(
        JSON.stringify({ error: "הסרטון לא נמצא" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a signed URL for the video file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("hypnosis-videos")
      .createSignedUrl(video.file_path, 7200); // 2 hour expiry

    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "שגיאה בטעינת הסרטון" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        title: video.title,
        description: video.description,
        duration_seconds: video.duration_seconds,
        video_url: signedUrlData.signedUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "שגיאה לא צפויה" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
