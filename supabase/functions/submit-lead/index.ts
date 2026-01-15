import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets when function cold starts)
// For production, consider using Redis or database-based rate limiting
const ipSubmissions = new Map<string, { count: number; firstSubmission: number }>();

// Rate limit: max 3 submissions per IP per 10 minutes
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipSubmissions.get(ip);
  
  if (!record) {
    // First submission from this IP
    ipSubmissions.set(ip, { count: 1, firstSubmission: now });
    return false;
  }
  
  // Check if window has expired
  if (now - record.firstSubmission > RATE_LIMIT_WINDOW_MS) {
    // Reset the window
    ipSubmissions.set(ip, { count: 1, firstSubmission: now });
    return false;
  }
  
  // Within window, check count
  if (record.count >= RATE_LIMIT_MAX) {
    console.log(`Rate limit exceeded for IP: ${ip}, count: ${record.count}`);
    return true;
  }
  
  // Increment count
  record.count++;
  ipSubmissions.set(ip, record);
  return false;
}

// Cleanup old entries periodically (simple garbage collection)
function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, record] of ipSubmissions.entries()) {
    if (now - record.firstSubmission > RATE_LIMIT_WINDOW_MS * 2) {
      ipSubmissions.delete(ip);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    console.log(`Lead submission from IP: ${clientIP}`);
    
    // Check rate limit
    if (isRateLimited(clientIP)) {
      console.log(`Blocked submission from rate-limited IP: ${clientIP}`);
      // Return success to not reveal rate limiting to bots
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Cleanup old entries occasionally
    if (Math.random() < 0.1) {
      cleanupOldEntries();
    }

    const { name, phone, email, preferred_time, source, honeypot, form_load_time, affiliate_code } = await req.json();
    
    // Server-side honeypot check
    if (honeypot) {
      console.log(`Blocked submission: honeypot filled by IP ${clientIP}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Server-side timing check (minimum 2 seconds)
    const MIN_FORM_TIME_MS = 2000;
    if (form_load_time && Date.now() - form_load_time < MIN_FORM_TIME_MS) {
      console.log(`Blocked submission: form submitted too quickly by IP ${clientIP}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate required fields
    if (!name?.trim() || !phone?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Name and phone are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Phone validation
    const phoneRegex = /^[\d\-+() ]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert lead
    const { error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        preferred_time: preferred_time?.trim() || null,
        source: source || 'unknown',
        affiliate_code: affiliate_code || null,
      });

    if (error) {
      console.error('Error inserting lead:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Lead submitted successfully from IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-lead function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
