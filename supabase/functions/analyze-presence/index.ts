import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Scoring Weights (deterministic, hardcoded) ───

const STRUCTURAL_WEIGHTS = {
  jaw_definition: 0.3,
  mandible_prominence: 0.25,
  zygomatic_projection: 0.2,
  shoulder_waist_ratio: 0.25,
};

const SYMMETRY_WEIGHTS = {
  facial_symmetry: 0.45,
  facial_thirds_balance: 0.3,
  upper_lower_balance: 0.25,
};

const COMPOSITION_WEIGHTS = {
  body_fat_band: 0.45,
  abdominal_definition: 0.3,
  chest_projection: 0.25,
};

const POSTURE_WEIGHTS = {
  forward_head: 0.3,
  rounded_shoulders: 0.3,
  pelvic_tilt: 0.2,
  thoracic_curvature: 0.2,
};

const PROJECTION_WEIGHTS = {
  neck_thickness: 0.2,
  chest_projection: 0.25,
  mandible_prominence: 0.25,
  posture_alignment: 0.3,
};

const PRESENCE_INDEX_WEIGHTS = {
  structural_integrity: 0.25,
  aesthetic_symmetry: 0.2,
  composition: 0.2,
  posture_alignment: 0.2,
  projection_potential: 0.15,
};

// ─── Band-to-numeric converters ───

const BAND_MAP: Record<string, number> = {
  very_low: 15, low: 30, moderate_low: 40, moderate: 50,
  moderate_high: 60, high: 75, very_high: 90,
};

const BODY_FAT_MAP: Record<string, number> = {
  very_lean: 90, lean: 75, moderate: 50, high: 25,
};

const SEVERITY_MAP: Record<string, number> = {
  none: 95, minimal: 80, mild: 65, moderate: 45, significant: 25, severe: 10,
};

function bandToScore(val: string | number, map: Record<string, number> = BAND_MAP): number {
  if (typeof val === "number") return Math.max(0, Math.min(100, val));
  return map[val?.toLowerCase?.()] ?? 50;
}

function severityToScore(val: string | number): number {
  if (typeof val === "number") return Math.max(0, Math.min(100, 100 - val));
  return SEVERITY_MAP[val?.toLowerCase?.()] ?? 50;
}

function weightedScore(values: Record<string, number>, weights: Record<string, number>): number {
  let total = 0, wSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (values[key] !== undefined) {
      total += values[key] * weight;
      wSum += weight;
    }
  }
  return wSum > 0 ? Math.round(total / wSum) : 50;
}

// ─── Deterministic Scoring Engine ───

function computeScores(m: any) {
  const numericMetrics: Record<string, number> = {
    jaw_definition: bandToScore(m.jaw_definition_index),
    mandible_prominence: bandToScore(m.mandible_prominence),
    zygomatic_projection: bandToScore(m.zygomatic_projection),
    shoulder_waist_ratio: bandToScore(m.shoulder_to_waist_ratio),
    facial_symmetry: bandToScore(m.facial_symmetry_band),
    facial_thirds_balance: bandToScore(m.facial_thirds_balance),
    upper_lower_balance: bandToScore(m.upper_lower_development_balance),
    body_fat_band: bandToScore(m.body_fat_band, BODY_FAT_MAP),
    abdominal_definition: bandToScore(m.abdominal_definition_likelihood),
    chest_projection: bandToScore(m.chest_projection),
    forward_head: severityToScore(m.forward_head_severity),
    rounded_shoulders: severityToScore(m.rounded_shoulders_severity),
    pelvic_tilt: severityToScore(m.pelvic_tilt_likelihood),
    thoracic_curvature: severityToScore(m.thoracic_curvature),
    neck_thickness: bandToScore(m.neck_thickness_proxy),
  };

  const structural_integrity = weightedScore(numericMetrics, STRUCTURAL_WEIGHTS);
  const aesthetic_symmetry = weightedScore(numericMetrics, SYMMETRY_WEIGHTS);
  const composition = weightedScore(numericMetrics, COMPOSITION_WEIGHTS);
  const posture_alignment = weightedScore(numericMetrics, POSTURE_WEIGHTS);

  const projectionInput = { ...numericMetrics, posture_alignment };
  const projection_potential = weightedScore(projectionInput, PROJECTION_WEIGHTS);

  const componentScores = {
    structural_integrity,
    aesthetic_symmetry,
    composition,
    posture_alignment,
    projection_potential,
  };

  const presence_index = weightedScore(componentScores, PRESENCE_INDEX_WEIGHTS);

  // Confidence band based on how many metrics were extracted
  const extractedCount = Object.values(m).filter((v) => v !== null && v !== undefined && v !== "").length;
  const totalExpected = 19;
  const confidence = extractedCount >= totalExpected * 0.8 ? "high" : extractedCount >= totalExpected * 0.5 ? "moderate" : "low";

  return {
    structural_integrity,
    aesthetic_symmetry,
    composition,
    posture_alignment,
    projection_potential,
    presence_index,
    confidence_band: confidence,
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

    const systemPrompt = `You are a clinical visual assessment system. Analyze the provided images and extract structured metrics. Return ONLY a valid JSON object with these exact keys and value types:

FACIAL METRICS:
- facial_symmetry_band: "low" | "moderate_low" | "moderate" | "moderate_high" | "high" | "very_high"
- jaw_definition_index: "low" | "moderate_low" | "moderate" | "moderate_high" | "high" | "very_high"
- facial_thirds_balance: "low" | "moderate" | "high"
- cheek_fat_distribution: "lean" | "moderate" | "high"
- eye_fatigue_probability: "low" | "moderate" | "high"
- skin_clarity_band: "low" | "moderate" | "high" | "very_high"
- hairline_maturity_band: "youthful" | "early_recession" | "moderate_recession" | "advanced"
- mandible_prominence: "low" | "moderate" | "high" | "very_high"
- zygomatic_projection: "low" | "moderate" | "high" | "very_high"

BODY METRICS:
- body_fat_band: "very_lean" | "lean" | "moderate" | "high"
- shoulder_to_waist_ratio: "low" | "moderate" | "high" | "very_high"
- neck_thickness_proxy: "low" | "moderate" | "high"
- upper_lower_development_balance: "low" | "moderate" | "high"
- abdominal_definition_likelihood: "low" | "moderate" | "high" | "very_high"
- chest_projection: "low" | "moderate" | "high" | "very_high"

POSTURE METRICS:
- forward_head_severity: "none" | "minimal" | "mild" | "moderate" | "significant" | "severe"
- rounded_shoulders_severity: "none" | "minimal" | "mild" | "moderate" | "significant" | "severe"
- pelvic_tilt_likelihood: "none" | "minimal" | "mild" | "moderate" | "significant"
- thoracic_curvature: "none" | "minimal" | "mild" | "moderate" | "significant"

CONFIDENCE:
- image_quality_assessment: "poor" | "acceptable" | "good" | "excellent"

Return ONLY the JSON object. No explanations, no markdown.`;

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
