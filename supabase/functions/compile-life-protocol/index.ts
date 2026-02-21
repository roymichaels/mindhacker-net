import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProtocolRow {
  id: string;
  user_id: string;
  wake_time: string;
  sleep_time: string;
  energy_peak_start: string | null;
  energy_peak_end: string | null;
  energy_crash_start: string | null;
  energy_crash_end: string | null;
  training_window_start: string | null;
  training_window_end: string | null;
  work_start: string | null;
  work_end: string | null;
  tier: string;
}

interface Block {
  protocol_id: string;
  day_index: number;
  start_time: string;
  end_time: string;
  block_type: string;
  title: string;
  description: string | null;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minToTime(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function compileBlocks(p: ProtocolRow): Block[] {
  const blocks: Block[] = [];
  const wake = timeToMin(p.wake_time);
  const sleep = timeToMin(p.sleep_time);

  // Track occupied slots
  const occupied: { start: number; end: number }[] = [];

  const add = (start: number, end: number, type: string, title: string, desc: string | null = null) => {
    if (start >= end || start >= sleep) return;
    const capped = Math.min(end, sleep);
    blocks.push({
      protocol_id: p.id,
      day_index: 0,
      start_time: minToTime(start),
      end_time: minToTime(capped),
      block_type: type,
      title,
      description: desc,
    });
    occupied.push({ start, end: capped });
  };

  // 1. Wake ritual
  add(wake, wake + 10, "wake", "Wake Protocol", "Sunlight + Hydration + Breath");

  // 2. Morning focus (aligned with energy peak if set)
  const peakStart = p.energy_peak_start ? timeToMin(p.energy_peak_start) : wake + 20;
  const peakEnd = p.energy_peak_end ? timeToMin(p.energy_peak_end) : peakStart + 120;

  // Pre-peak focus prep
  if (wake + 10 < peakStart) {
    add(wake + 10, Math.min(wake + 30, peakStart), "reflection", "Morning Reflection", "Intention setting + journal");
  }

  // Deep work block 1 (energy peak)
  const trainStart = p.training_window_start ? timeToMin(p.training_window_start) : peakEnd;
  const deepWork1End = Math.min(peakEnd, trainStart);
  if (peakStart < deepWork1End) {
    add(Math.max(peakStart, wake + 30), deepWork1End, "focus", "Deep Work — Peak Energy", "High-intensity cognitive work aligned with energy peak");
  }

  // 3. Training window
  const trainEnd = p.training_window_end ? timeToMin(p.training_window_end) : trainStart + 60;
  if (trainStart < sleep) {
    add(trainStart, Math.min(trainEnd, sleep), "training", "Training Session", "Physical training block");
  }

  // 4. Post-training recovery
  if (trainEnd < sleep) {
    add(trainEnd, Math.min(trainEnd + 15, sleep), "recovery", "Post-Training Recovery", "Cool down + nutrition");
  }

  // 5. Work blocks
  const workStart = p.work_start ? timeToMin(p.work_start) : trainEnd + 15;
  const workEnd = p.work_end ? timeToMin(p.work_end) : workStart + 480;
  const crashStart = p.energy_crash_start ? timeToMin(p.energy_crash_start) : workStart + 300;
  const crashEnd = p.energy_crash_end ? timeToMin(p.energy_crash_end) : crashStart + 60;

  // Work block 1 (pre-crash)
  const wb1Start = Math.max(workStart, trainEnd + 15);
  if (wb1Start < crashStart && wb1Start < workEnd) {
    add(wb1Start, Math.min(crashStart, workEnd), "work", "Work Block 1", "Structured work session");
  }

  // Mid-day meal
  const mealTime = Math.max(crashStart - 30, wb1Start + 120);
  if (mealTime > wb1Start && mealTime < sleep) {
    add(mealTime, Math.min(mealTime + 30, sleep), "meal", "Midday Fuel", "Nutrition break");
  }

  // Recovery during crash
  if (crashStart < sleep && crashStart < workEnd) {
    add(crashStart, Math.min(crashEnd, sleep), "recovery", "Energy Recovery", "Low-intensity recovery during crash window");
  }

  // Work block 2 (post-crash)
  if (crashEnd < workEnd && crashEnd < sleep) {
    add(crashEnd, Math.min(workEnd, sleep), "work", "Work Block 2", "Afternoon execution");
  }

  // 6. Evening blocks
  const eveningStart = Math.max(workEnd, crashEnd);

  // Play / expansion
  if (eveningStart + 30 < sleep) {
    add(eveningStart, Math.min(eveningStart + 60, sleep - 60), "play", "Regeneration / Play", "Creative exploration or social connection");
  }

  // Admin block
  const adminStart = eveningStart + 60;
  if (adminStart < sleep - 30) {
    add(adminStart, Math.min(adminStart + 30, sleep - 30), "admin", "Admin & Planning", "Email, logistics, tomorrow's prep");
  }

  // Evening reflection
  const reflectStart = sleep - 30;
  if (reflectStart > eveningStart) {
    add(reflectStart, sleep - 10, "reflection", "Evening Shutdown", "Review day + gratitude + tomorrow's intention");
  }

  // Sleep ritual
  add(sleep - 10, sleep, "sleep", "Sleep Protocol", "Devices off, wind-down");

  // Sort by start time
  blocks.sort((a, b) => timeToMin(a.start_time) - timeToMin(b.start_time));

  return blocks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { protocol_id } = await req.json();
    if (!protocol_id) {
      return new Response(JSON.stringify({ error: "Missing protocol_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch protocol
    const { data: protocol, error: fetchErr } = await supabase
      .from("life_protocols")
      .select("*")
      .eq("id", protocol_id)
      .single();

    if (fetchErr || !protocol) {
      return new Response(JSON.stringify({ error: "Protocol not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear existing blocks for this protocol (recompile)
    await supabase.from("protocol_blocks").delete().eq("protocol_id", protocol_id);

    // Compile blocks
    const blocks = compileBlocks(protocol as ProtocolRow);

    // Insert blocks
    if (blocks.length > 0) {
      const { error: insertErr } = await supabase.from("protocol_blocks").insert(blocks);
      if (insertErr) throw insertErr;
    }

    // Update protocol status
    await supabase
      .from("life_protocols")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", protocol_id);

    return new Response(
      JSON.stringify({ success: true, blocks_created: blocks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Compile error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
