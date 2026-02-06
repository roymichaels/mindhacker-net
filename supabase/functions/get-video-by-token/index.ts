import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { jsonResponse, badRequestResponse, errorResponse, notFoundResponse, forbiddenResponse } from "../_shared/responses.ts";
import { logError } from "../_shared/errorHandling.ts";

serve(async (req) => {
  if (isCorsPreFlight(req)) {
    return handleCorsPreFlight();
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return badRequestResponse("קישור לא תקין");
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
      logError("get-video-by-token", accessError);
      return errorResponse("שגיאה בטעינת הסרטון");
    }

    if (!accessRecord) {
      return notFoundResponse("קישור לא תקין או שפג תוקפו");
    }

    // Check if access is active
    if (!accessRecord.is_active) {
      return forbiddenResponse("הגישה לסרטון הושבתה");
    }

    // Check if access has expired
    if (accessRecord.expires_at && new Date(accessRecord.expires_at) < new Date()) {
      return forbiddenResponse("הגישה לסרטון פגה");
    }

    const video = accessRecord.hypnosis_videos as any;
    if (!video) {
      return notFoundResponse("הסרטון לא נמצא");
    }

    // Generate a signed URL for the video file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("hypnosis-videos")
      .createSignedUrl(video.file_path, 7200); // 2 hour expiry

    if (signedUrlError) {
      logError("get-video-by-token", signedUrlError, { context: "signed URL creation" });
      return errorResponse("שגיאה בטעינת הסרטון");
    }

    return jsonResponse({
      title: video.title,
      description: video.description,
      duration_seconds: video.duration_seconds,
      video_url: signedUrlData.signedUrl,
    });
  } catch (err) {
    logError("get-video-by-token", err);
    return errorResponse("שגיאה לא צפויה");
  }
});
