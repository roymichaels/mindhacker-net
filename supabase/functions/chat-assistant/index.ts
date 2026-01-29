/**
 * @deprecated This function is deprecated. Use aurora-chat with mode='widget' instead.
 * 
 * This file is kept for backwards compatibility but will be removed in a future version.
 * All widget chat functionality has been migrated to aurora-chat which supports multiple modes:
 * - 'widget' - Guest-facing chat assistant (replaces this function)
 * - 'full' - Complete Aurora life coaching experience
 * - 'lite' - Simplified quick interactions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Redirect to aurora-chat with widget mode
  const body = await req.json();
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/aurora-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.get('Authorization') || '',
    },
    body: JSON.stringify({
      ...body,
      mode: 'widget'
    }),
  });

  // Forward the response
  return new Response(response.body, {
    status: response.status,
    headers: {
      ...corsHeaders,
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
});
