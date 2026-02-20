import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Differential Geometry Scoring Engine ───
// Uses granular numeric scores (0-100) from AI extraction.
// No band-to-score conversion — scores are already numeric.

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function avg(...vals: (number | null | undefined)[]): number {
  const valid = vals.filter((v): v is number => v !== null && v !== undefined);
  return valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 45;
}

function weightedAvg(items: { score: number; weight: number }[]): number {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  if (totalWeight === 0) return 45;
  return Math.round(items.reduce((sum, i) => sum + i.score * i.weight, 0) / totalWeight);
}

// Non-linear penalty: small deviations penalize lightly, large exponentially
function nonLinearPenalty(score: number): number {
  const deficit = 100 - score;
  if (deficit <= 10) return score;
  if (deficit <= 30) return 100 - deficit * 1.1;
  return 100 - deficit * 1.3;
}

function computeScores(m: any) {
  // ── Bone Structure Score ──
  const bone_structure = clamp(avg(
    m.jaw_width_score,
    m.chin_projection_score,
    m.brow_ridge_score,
    m.facial_symmetry_score,
  ));

  // ── Soft Tissue Overlay Score ──
  const soft_tissue = clamp(avg(
    m.submental_fullness_score,
    m.jaw_neck_angle_score,
    m.cheek_fullness_score,
    m.facial_puffiness_score,
  ));

  // ── Combined Facial Structure (0.6 bone + 0.4 soft tissue) ──
  const structural_integrity = weightedAvg([
    { score: bone_structure, weight: 0.6 },
    { score: soft_tissue, weight: 0.4 },
  ]);

  // ── Aesthetic Symmetry (from facial symmetry score directly) ──
  const aesthetic_symmetry = clamp(m.facial_symmetry_score ?? bone_structure);

  // ── Posture Alignment (non-linear penalty) ──
  const posture_alignment = clamp(nonLinearPenalty(avg(
    m.ear_shoulder_deviation_score,
    m.neck_forward_translation_score,
    m.rounded_shoulders_score,
    m.thoracic_curvature_score,
  )));

  // ── Body Composition (contour-based) ──
  const composition = clamp(avg(
    m.jaw_neck_definition_score,
    m.abdominal_projection_score,
    m.chest_contour_score,
  ));

  // ── Frame Development ──
  const frame = clamp(avg(
    m.shoulder_waist_ratio_score,
    m.upper_back_thickness_score,
    m.deltoid_projection_score,
  ));

  // ── Inflammation / Puffiness (with lighting correction) ──
  let inflammation = clamp(avg(
    m.under_eye_swelling_score,
    m.cheek_fluid_score,
    m.skin_shine_score,
    m.facial_edge_clarity_score,
  ));
  if (m.lighting_condition === "high_frontal_flash") {
    inflammation = Math.round(inflammation * 0.8 + 20);
  }

  // ── Projection Potential ──
  const projection_potential = weightedAvg([
    { score: frame, weight: 0.3 },
    { score: posture_alignment, weight: 0.3 },
    { score: bone_structure, weight: 0.25 },
    { score: composition, weight: 0.15 },
  ]);

  // ── Presence Index ──
  const presence_index = weightedAvg([
    { score: structural_integrity, weight: 0.25 },
    { score: posture_alignment, weight: 0.25 },
    { score: composition, weight: 0.20 },
    { score: frame, weight: 0.15 },
    { score: inflammation, weight: 0.15 },
  ]);

  // ── Confidence ──
  const numericKeys = Object.keys(m).filter(k => k.endsWith('_score'));
  const extractedCount = numericKeys.filter(k => m[k] !== null && m[k] !== undefined).length;
  const totalExpected = 21;
  const signalConsistency = m.signal_consistency ?? "medium";
  let confidence = "moderate";
  if (extractedCount >= totalExpected * 0.8 && signalConsistency === "high") confidence = "high";
  else if (extractedCount < totalExpected * 0.5 || signalConsistency === "low") confidence = "low";

  return {
    structural_integrity,
    aesthetic_symmetry,
    composition,
    posture_alignment,
    projection_potential,
    presence_index,
    confidence_band: confidence,
    inflammation,
    frame,
    bone_structure,
    soft_tissue,
    lighting_correction: m.lighting_condition === "high_frontal_flash" ? "high_flash" : null,
  };
}

// ─── Delta Computation ───

function computeDeltas(current: any, previous: any): Record<string, any> | null {
  if (!previous?.derived_metrics) return null;
  const deltas: Record<string, any> = {};
  const cur = current;
  const prev = previous.derived_metrics;

  for (const key of Object.keys(cur)) {
    if (prev[key] !== undefined) {
      deltas[key] = { previous: prev[key], current: cur[key], change: typeof cur[key] === "number" && typeof prev[key] === "number" ? cur[key] - prev[key] : "band_shift" };
    }
  }
  return Object.keys(deltas).length > 0 ? deltas : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth: get user from JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { scan_images } = await req.json();
    if (!scan_images || Object.keys(scan_images).length === 0) {
      return new Response(JSON.stringify({ error: "No scan images provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate signed URLs for images
    const imageUrls: Record<string, string> = {};
    for (const [key, path] of Object.entries(scan_images)) {
      if (!path) continue;
      const { data, error } = await supabase.storage.from("presence-scans").createSignedUrl(path as string, 600);
      if (data?.signedUrl) imageUrls[key] = data.signedUrl;
    }

    if (Object.keys(imageUrls).length === 0) {
      return new Response(JSON.stringify({ error: "Could not access scan images" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build vision prompt
    const imageContent = Object.entries(imageUrls).map(([key, url]) => ([
      { type: "text", text: `[${key.replace(/_/g, " ").toUpperCase()}]` },
      { type: "image_url", image_url: { url } },
    ])).flat();

    const systemPrompt = `You are a differential geometry-based visual assessment system. Analyze the provided images and extract structured numeric scores (0-100) plus categorical metrics. DO NOT default scores to 50. Each score must reflect actual detected signals from the images. Return ONLY a valid JSON object with these exact keys and value types:

BONE STRUCTURE (0-100 numeric scores):
- jaw_width_score: number (0-100, jaw width relative to cheek width)
- chin_projection_score: number (0-100, chin projection from profile view)
- brow_ridge_score: number (0-100, brow ridge prominence)
- facial_symmetry_score: number (0-100, bilateral facial symmetry)

SOFT TISSUE OVERLAY (0-100 numeric scores):
- submental_fullness_score: number (0-100, inverted — 100 = lean, 0 = full)
- jaw_neck_angle_score: number (0-100, definition of jaw-to-neck angle)
- cheek_fullness_score: number (0-100, inverted — 100 = lean contour)
- facial_puffiness_score: number (0-100, inverted — 100 = no puffiness)

POSTURE (0-100 numeric scores):
- ear_shoulder_deviation_score: number (0-100, 100 = perfect vertical alignment)
- neck_forward_translation_score: number (0-100, 100 = no forward translation)
- rounded_shoulders_score: number (0-100, 100 = no rounding)
- thoracic_curvature_score: number (0-100, 100 = neutral spine)

BODY COMPOSITION (0-100 numeric scores):
- jaw_neck_definition_score: number (0-100, contour contrast)
- abdominal_projection_score: number (0-100, inverted — 100 = flat)
- chest_contour_score: number (0-100, muscle vs softness contrast)

FRAME DEVELOPMENT (0-100 numeric scores):
- shoulder_waist_ratio_score: number (0-100, higher = wider shoulders relative to waist)
- upper_back_thickness_score: number (0-100, visible muscle mass signal)
- deltoid_projection_score: number (0-100, shoulder cap development)

INFLAMMATION / PUFFINESS (0-100 numeric scores):
- under_eye_swelling_score: number (0-100, inverted — 100 = no swelling)
- cheek_fluid_score: number (0-100, inverted — 100 = no fluid retention)
- skin_shine_score: number (0-100, inverted — 100 = matte, 0 = high shine)
- facial_edge_clarity_score: number (0-100, 100 = sharp edges)

CATEGORICAL METRICS:
- skin_texture_issues: "none" | "mild" | "moderate" | "significant"
- acne_visibility: "none" | "mild" | "moderate" | "significant"
- lighting_condition: "natural" | "indoor_even" | "high_frontal_flash" | "poor"
- image_quality_assessment: "poor" | "acceptable" | "good" | "excellent"
- signal_consistency: "high" | "medium" | "low"

Return ONLY the JSON object. No explanations, no markdown. Each numeric score MUST reflect actual geometry — do NOT default to 50.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: imageContent },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown fences if present
    rawContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let derivedMetrics: any;
    try {
      derivedMetrics = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return new Response(JSON.stringify({ error: "AI returned invalid metrics format" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Compute deterministic scores
    const scores = computeScores(derivedMetrics);

    // Get previous scan for delta
    const { data: prevScans } = await supabase
      .from("presence_scans")
      .select("derived_metrics, scores, scan_number")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const previousScan = prevScans?.[0] ?? null;
    const deltaMetrics = computeDeltas(derivedMetrics, previousScan);
    const scanNumber = (previousScan?.scan_number ?? 0) + 1;

    // Generate direct mode notes
    const weakComponents = Object.entries(scores)
      .filter(([k, v]) => k !== "presence_index" && k !== "confidence_band" && typeof v === "number" && v < 60)
      .sort((a, b) => (a[1] as number) - (b[1] as number));

    const directModeNotes: Record<string, string> = {};
    for (const [key, val] of weakComponents) {
      const label = key.replace(/_/g, " ");
      if (val < 35) directModeNotes[key] = `Critical deficit in ${label}. Immediate protocol intervention required.`;
      else if (val < 50) directModeNotes[key] = `${label} below functional threshold. Targeted correction needed.`;
      else directModeNotes[key] = `${label} suboptimal. Marginal gains available with consistent protocol adherence.`;
    }

    // Save to DB
    const { data: savedScan, error: saveError } = await supabase
      .from("presence_scans")
      .insert({
        user_id: user.id,
        scan_images,
        derived_metrics: derivedMetrics,
        scores,
        delta_metrics: deltaMetrics,
        direct_mode_notes: directModeNotes,
        scan_number: scanNumber,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save scan:", saveError);
      return new Response(JSON.stringify({ error: "Failed to save scan results" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log energy event
    await supabase.from("presence_scan_events").insert({
      user_id: user.id,
      scan_id: savedScan.id,
      event_type: previousScan ? "rescan" : "full_scan",
      energy_cost: previousScan ? 15 : 10,
    });

    return new Response(JSON.stringify(savedScan), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-presence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
