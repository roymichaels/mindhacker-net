import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { jsonResponse, unauthorizedResponse, forbiddenResponse, badRequestResponse, errorResponse } from "../_shared/responses.ts";
import { logError, safeParseJson } from "../_shared/errorHandling.ts";

serve(async (req) => {
  if (isCorsPreFlight(req)) {
    return handleCorsPreFlight();
  }

  try {
    // Get authenticated user from request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return unauthorizedResponse();
    }

    // Check if user has admin role
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return forbiddenResponse('Admin access required');
    }

    // Get the user ID to fetch from request body with validation
    const requestSchema = z.object({
      userId: z.string().uuid('Invalid user ID format')
    });

    const { data: body, error: parseError } = await safeParseJson<{ userId: string }>(req);
    
    if (parseError) {
      return badRequestResponse(parseError);
    }

    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return jsonResponse({ 
        error: 'Invalid request data',
        details: result.error.issues.map(issue => issue.message)
      }, 400);
    }

    const { userId } = result.data;

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Safely fetch user data using admin client
    const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (fetchError) {
      logError('get-user-data', fetchError);
      return errorResponse('Failed to fetch user data');
    }

    return jsonResponse({ user: userData.user });

  } catch (error) {
    logError('get-user-data', error);
    return errorResponse('Internal server error');
  }
});
