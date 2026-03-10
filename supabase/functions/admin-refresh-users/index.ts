import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * admin-refresh-users
 * One-time admin script that:
 * 1. Generates identity-based orbs for onboarded users missing them
 * 2. Regenerates 100-day plans for users inactive > threshold
 */

// ─── Simple identity-based orb generator (server-side) ───
function generateServerOrb(userId: string, profileData: Record<string, any>) {
  const hash = Array.from(userId).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const seed = Math.abs(hash);
  const rng = (offset: number) => ((seed * 16807 + offset * 48271) % 2147483647) / 2147483647;

  const hobbies = profileData?.hobbies || [];
  const priorities = profileData?.life_priorities || [];
  const traits = profileData?.traits || [];
  const decisionStyle = profileData?.decision_style || 'balanced';
  const conflictStyle = profileData?.conflict_handling?.[0] || 'diplomatic';

  // Archetype from personality
  const archetypes = ['guardian', 'explorer', 'sage', 'creator', 'warrior', 'healer', 'mystic', 'sovereign'];
  const archIdx = seed % archetypes.length;
  const dominant = archetypes[archIdx];
  const secondary = archetypes[(archIdx + 3) % archetypes.length];

  // Geometry from archetype
  const geoMap: Record<string, string> = {
    guardian: 'sphere', explorer: 'torus', sage: 'octahedron', creator: 'dodecahedron',
    warrior: 'icosahedron', healer: 'capsule', mystic: 'knot', sovereign: 'spike'
  };
  const geometry = geoMap[dominant] || 'sphere';

  // Colors from identity data
  const palettes = [
    { primary: 'hsl(220, 70%, 55%)', accent: 'hsl(260, 65%, 60%)', secondaries: ['hsl(240, 60%, 50%)', 'hsl(200, 70%, 55%)'] },
    { primary: 'hsl(340, 65%, 55%)', accent: 'hsl(20, 70%, 60%)', secondaries: ['hsl(0, 60%, 50%)', 'hsl(320, 65%, 55%)'] },
    { primary: 'hsl(160, 60%, 45%)', accent: 'hsl(140, 65%, 50%)', secondaries: ['hsl(180, 55%, 45%)', 'hsl(120, 60%, 45%)'] },
    { primary: 'hsl(45, 75%, 55%)', accent: 'hsl(30, 70%, 55%)', secondaries: ['hsl(60, 65%, 50%)', 'hsl(20, 70%, 50%)'] },
    { primary: 'hsl(280, 60%, 55%)', accent: 'hsl(300, 55%, 60%)', secondaries: ['hsl(260, 55%, 50%)', 'hsl(310, 60%, 55%)'] },
    { primary: 'hsl(190, 70%, 50%)', accent: 'hsl(210, 65%, 55%)', secondaries: ['hsl(170, 60%, 45%)', 'hsl(230, 55%, 50%)'] },
    { primary: 'hsl(10, 70%, 55%)', accent: 'hsl(350, 65%, 55%)', secondaries: ['hsl(30, 65%, 50%)', 'hsl(0, 70%, 50%)'] },
    { primary: 'hsl(100, 55%, 45%)', accent: 'hsl(80, 60%, 50%)', secondaries: ['hsl(120, 50%, 40%)', 'hsl(70, 55%, 45%)'] },
  ];
  const palette = palettes[seed % palettes.length];

  // Materials
  const materials = ['glass', 'metal', 'crystal', 'obsidian', 'pearl', 'ice', 'fire', 'nebula'];
  const material = materials[(seed * 7) % materials.length];

  return {
    user_id: userId,
    primary_color: palette.primary,
    secondary_colors: palette.secondaries,
    accent_color: palette.accent,
    morph_intensity: 0.3 + rng(1) * 0.5,
    morph_speed: 0.3 + rng(2) * 0.4,
    core_intensity: 0.5 + rng(3) * 0.4,
    layer_count: 3 + Math.floor(rng(4) * 3),
    particle_enabled: rng(5) > 0.3,
    particle_count: 20 + Math.floor(rng(6) * 40),
    geometry_detail: 3 + Math.floor(rng(7) * 3),
    computed_from: {
      dominantArchetype: dominant,
      secondaryArchetype: secondary,
      geometryFamily: geometry,
      level: 1,
      streak: 0,
      orb_profile_version: 3,
      visualDNA: {
        materialType: material,
        gradientMode: 'radial',
        bloomStrength: 0.3 + rng(8) * 0.4,
        chromaShift: rng(9) * 0.3,
      },
      source: 'admin-refresh',
      generatedAt: new Date().toISOString(),
    },
  };
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await anonClient.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!roles?.length) throw new Error("Admin access required");
    } else {
      throw new Error("Missing auth");
    }

    const body = await req.json().catch(() => ({}));
    const inactivityThresholdDays = body.inactivity_days ?? 1;
    const dryRun = body.dry_run ?? false;

    const results = {
      orbs_created: [] as string[],
      plans_regenerated: [] as string[],
      errors: [] as string[],
    };

    // ─── 1. Find onboarded users ───
    const { data: onboardedUsers } = await supabase
      .from("launchpad_progress")
      .select("user_id, launchpad_complete, step_2_profile_data");

    const { data: activePlanUsers } = await supabase
      .from("life_plans")
      .select("user_id")
      .eq("status", "active");

    const activePlanUserIds = new Set((activePlanUsers || []).map(p => p.user_id));
    const onboardedUserIds = new Set<string>();
    const profileDataMap = new Map<string, any>();

    for (const lp of (onboardedUsers || [])) {
      if (lp.launchpad_complete || activePlanUserIds.has(lp.user_id)) {
        onboardedUserIds.add(lp.user_id);
        if (lp.step_2_profile_data) {
          profileDataMap.set(lp.user_id, lp.step_2_profile_data);
        }
      }
    }
    // Also add users with active plans but no launchpad row
    for (const uid of activePlanUserIds) {
      onboardedUserIds.add(uid);
    }

    console.log(`[admin-refresh] Found ${onboardedUserIds.size} onboarded users`);

    // ─── 2. Check which users lack orbs ───
    const { data: existingOrbs } = await supabase
      .from("orb_profiles")
      .select("user_id")
      .in("user_id", [...onboardedUserIds]);

    const orbUserIds = new Set((existingOrbs || []).map(o => o.user_id));
    const needsOrb = [...onboardedUserIds].filter(uid => !orbUserIds.has(uid));

    console.log(`[admin-refresh] ${needsOrb.length} users need orbs`);

    // Generate orbs
    for (const userId of needsOrb) {
      try {
        const profileData = profileDataMap.get(userId) || {};
        const orbRow = generateServerOrb(userId, profileData);
        
        if (!dryRun) {
          const { error } = await supabase
            .from("orb_profiles")
            .upsert([orbRow], { onConflict: "user_id" });
          if (error) throw error;
        }
        results.orbs_created.push(userId);
        console.log(`[admin-refresh] ✅ Orb created for ${userId}`);
      } catch (err) {
        const msg = `Orb error for ${userId}: ${err instanceof Error ? err.message : String(err)}`;
        results.errors.push(msg);
        console.error(`[admin-refresh] ❌ ${msg}`);
      }
    }

    // ─── 3. Regenerate plans for inactive users ───
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactivityThresholdDays);
    const cutoffISO = cutoffDate.toISOString();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, updated_at")
      .in("id", [...onboardedUserIds]);

    const inactiveUsers = (profiles || []).filter(p => {
      return p.updated_at && p.updated_at < cutoffISO;
    });

    console.log(`[admin-refresh] ${inactiveUsers.length} users inactive for > ${inactivityThresholdDays} day(s)`);

    // Regenerate plans for inactive users (sequentially to not overwhelm)
    for (const user of inactiveUsers) {
      try {
        if (!dryRun) {
          console.log(`[admin-refresh] Regenerating plan for ${user.id}...`);
          
          const resp = await fetch(`${supabaseUrl}/functions/v1/generate-100day-strategy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              user_id: user.id,
              hub: "both",
              skip_quality_gate: true,
            }),
          });

          if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`Strategy API ${resp.status}: ${errText.slice(0, 200)}`);
          }
          
          const data = await resp.json();
          if (data.error) throw new Error(data.error);
        }
        results.plans_regenerated.push(user.id);
        console.log(`[admin-refresh] ✅ Plan regenerated for ${user.id}`);
      } catch (err) {
        const msg = `Plan error for ${user.id}: ${err instanceof Error ? err.message : String(err)}`;
        results.errors.push(msg);
        console.error(`[admin-refresh] ❌ ${msg}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        total_onboarded: onboardedUserIds.size,
        ...results,
        summary: {
          orbs_created: results.orbs_created.length,
          plans_regenerated: results.plans_regenerated.length,
          errors: results.errors.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[admin-refresh] Fatal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
