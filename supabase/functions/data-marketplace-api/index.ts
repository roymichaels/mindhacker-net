/**
 * Edge Function: data-marketplace-api
 * Buyer-facing API for browsing and purchasing anonymized datasets.
 * 
 * Endpoints (via action param):
 * - list_datasets: Browse available data listings
 * - purchase: Buy a dataset (creates purchase + generates access token)
 * - download: Download purchased snapshot via access token
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsPreFlight } from '../_shared/cors.ts';

function generateAccessToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCorsPreFlight();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.json();
    const { action } = body;

    // ─── LIST DATASETS ───
    if (action === 'list_datasets') {
      const { data, error } = await supabase
        .from('fm_data_listings')
        .select('id, title, description, category, data_points_count, contributor_count, price_mos, status, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ datasets: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── PURCHASE DATASET ───
    if (action === 'purchase') {
      const { listing_id, buyer_email, buyer_org } = body;

      if (!listing_id || !buyer_email) {
        return new Response(JSON.stringify({ error: 'listing_id and buyer_email are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get listing
      const { data: listing, error: listErr } = await supabase
        .from('fm_data_listings')
        .select('*')
        .eq('id', listing_id)
        .eq('status', 'active')
        .single();

      if (listErr || !listing) {
        return new Response(JSON.stringify({ error: 'Listing not found or inactive' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate fresh snapshot
      const { data: snapshotId, error: snapErr } = await supabase.rpc('fm_generate_snapshot', {
        p_category: listing.category,
        p_listing_id: listing.id,
      });

      if (snapErr) {
        console.error('Snapshot generation failed:', snapErr);
        return new Response(JSON.stringify({ error: 'Failed to generate dataset: ' + snapErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create purchase record with access token
      const accessToken = generateAccessToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const { data: purchase, error: purchErr } = await supabase
        .from('fm_data_purchases')
        .insert({
          buyer_id: crypto.randomUUID(), // external buyer
          buyer_email,
          buyer_org: buyer_org || null,
          listing_id: listing.id,
          snapshot_id: snapshotId,
          price_mos: listing.price_mos,
          price_usd: listing.price_mos / 100, // 100 MOS = $1
          status: 'completed',
          access_token: accessToken,
          access_expires_at: expiresAt,
        })
        .select('id, price_mos, price_usd, access_token, access_expires_at')
        .single();

      if (purchErr) throw purchErr;

      // Distribute revenue to contributors
      const { data: paidCount, error: distErr } = await supabase.rpc('fm_distribute_revenue', {
        p_purchase_id: purchase.id,
      });

      if (distErr) {
        console.error('Revenue distribution failed (non-blocking):', distErr);
      }

      return new Response(JSON.stringify({
        success: true,
        purchase: {
          id: purchase.id,
          price_mos: purchase.price_mos,
          price_usd: purchase.price_usd,
          access_token: purchase.access_token,
          expires_at: purchase.access_expires_at,
          contributors_paid: paidCount || 0,
        },
        download_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/data-marketplace-api`,
        download_instructions: 'POST with { "action": "download", "access_token": "<your_token>" }',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── DOWNLOAD DATASET ───
    if (action === 'download') {
      const { access_token } = body;

      if (!access_token) {
        return new Response(JSON.stringify({ error: 'access_token is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find purchase by token
      const { data: purchase, error: pErr } = await supabase
        .from('fm_data_purchases')
        .select('id, snapshot_id, status, access_expires_at, downloaded_at')
        .eq('access_token', access_token)
        .single();

      if (pErr || !purchase) {
        return new Response(JSON.stringify({ error: 'Invalid access token' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (purchase.status !== 'completed') {
        return new Response(JSON.stringify({ error: 'Purchase not completed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (purchase.access_expires_at && new Date(purchase.access_expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'Access token expired' }), {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch snapshot data
      const { data: snapshot, error: sErr } = await supabase
        .from('fm_data_snapshots')
        .select('category, snapshot_data, contributor_count, data_points, date_range_start, date_range_end, quality_score, generated_at')
        .eq('id', purchase.snapshot_id)
        .single();

      if (sErr || !snapshot) {
        return new Response(JSON.stringify({ error: 'Snapshot not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mark as downloaded
      await supabase
        .from('fm_data_purchases')
        .update({ downloaded_at: new Date().toISOString() })
        .eq('id', purchase.id);

      return new Response(JSON.stringify({
        dataset: {
          category: snapshot.category,
          data: snapshot.snapshot_data,
          metadata: {
            contributor_count: snapshot.contributor_count,
            data_points: snapshot.data_points,
            date_range: { start: snapshot.date_range_start, end: snapshot.date_range_end },
            quality_score: snapshot.quality_score,
            generated_at: snapshot.generated_at,
          },
          license: 'MindOS Anonymized Data License v1.0 — aggregated, non-reversible, research-only',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: list_datasets, purchase, download' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Marketplace API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
