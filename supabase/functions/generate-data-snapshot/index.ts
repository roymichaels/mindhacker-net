/**
 * Edge Function: generate-data-snapshot
 * Generates anonymized data snapshots for the marketplace.
 * Called by admin/cron — not user-facing.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsPreFlight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCorsPreFlight();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { category, listing_id } = await req.json();

    if (!category) {
      return new Response(JSON.stringify({ error: 'category is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validCategories = ['sleep_patterns', 'habit_trends', 'mood_signals', 'training_results'];
    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call the DB function to generate snapshot
    const { data, error } = await supabase.rpc('fm_generate_snapshot', {
      p_category: category,
      p_listing_id: listing_id || null,
    });

    if (error) {
      console.error('Snapshot generation error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      snapshot_id: data,
      category,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
