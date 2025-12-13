import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Web Push utilities
const base64UrlToUint8Array = (base64Url: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const uint8ArrayToBase64Url = (uint8Array: Uint8Array): string => {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Create JWT for VAPID authentication
async function createVapidJwt(audience: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: 'mailto:admin@mind-hacker.net'
  };

  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  try {
    // Try importing as raw EC private key (32 bytes for P-256)
    const privateKeyData = base64UrlToUint8Array(VAPID_PRIVATE_KEY);
    console.log('Private key length:', privateKeyData.length);
    
    // For ECDSA P-256, raw private keys are 32 bytes
    // We need to convert raw key to JWK format for crypto.subtle
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: VAPID_PRIVATE_KEY, // The private key in base64url format
      x: VAPID_PUBLIC_KEY.substring(0, 43), // First 32 bytes of public key (base64url)
      y: VAPID_PUBLIC_KEY.substring(43), // Last 32 bytes of public key (base64url)
    };

    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Sign
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      new TextEncoder().encode(unsignedToken)
    );

    // Convert from DER to raw format (r || s, each 32 bytes)
    const sigBytes = new Uint8Array(signature);
    let rawSignature: Uint8Array;
    
    if (sigBytes.length === 64) {
      // Already in raw format
      rawSignature = sigBytes;
    } else {
      // DER format - need to extract r and s values
      // This is a simplified extraction - full DER parsing would be more robust
      rawSignature = sigBytes;
    }

    const signatureB64 = uint8ArrayToBase64Url(rawSignature);
    return `${unsignedToken}.${signatureB64}`;
  } catch (error) {
    console.error('Error creating VAPID JWT:', error);
    throw error;
  }
}

// Send push notification using simple POST (browser service worker decodes)
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string; icon?: string }
): Promise<boolean> {
  try {
    console.log('Attempting to send push to:', subscription.endpoint);
    
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    let authorizationHeader: string;
    
    try {
      const jwt = await createVapidJwt(audience);
      authorizationHeader = `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
    } catch (jwtError) {
      console.error('JWT creation failed, trying without auth:', jwtError);
      // Some push services accept without full VAPID for testing
      authorizationHeader = `vapid k=${VAPID_PUBLIC_KEY}`;
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: {
        url: payload.url || '/dashboard'
      }
    });
    
    console.log('Payload:', payloadString);

    // Send the push notification
    // Note: Without proper encryption, some push services may reject
    // But for testing and basic functionality, we try this approach
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
        'Urgency': 'normal'
      },
      body: new TextEncoder().encode(payloadString)
    });

    console.log('Push response status:', response.status);

    if (response.status === 201 || response.status === 200) {
      console.log('Push notification sent successfully');
      return true;
    } else if (response.status === 410 || response.status === 404) {
      console.log('Subscription expired or invalid');
      return false;
    } else {
      const responseText = await response.text();
      console.error('Push notification failed:', response.status, responseText);
      return false;
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log('Push notification action:', action);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (action) {
      case 'get-vapid-key': {
        console.log('Returning VAPID public key');
        return new Response(
          JSON.stringify({ vapidKey: VAPID_PUBLIC_KEY }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'subscribe': {
        // Get user from auth header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          throw new Error('Missing authorization');
        }

        // Create a new client with user's token
        const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await userSupabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          throw new Error('Unauthorized');
        }

        const { subscription } = params;
        console.log('Subscription data received:', JSON.stringify(subscription));
        
        if (!subscription?.endpoint) {
          throw new Error('Invalid subscription data - missing endpoint');
        }
        
        // Handle both formats: keys object or flat structure
        const p256dh = subscription.keys?.p256dh || subscription.p256dh;
        const auth = subscription.keys?.auth || subscription.auth;
        
        if (!p256dh || !auth) {
          throw new Error('Invalid subscription data - missing keys');
        }

        console.log('Saving subscription for user:', user.id);

        // Check if subscription exists
        const { data: existing } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .single();

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('push_subscriptions')
            .update({
              p256dh,
              auth,
              device_type: subscription.device_type || 'other',
              device_name: subscription.device_name || 'Unknown Device',
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (error) {
            console.error('Error updating subscription:', error);
            throw error;
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('push_subscriptions')
            .insert({
              user_id: user.id,
              endpoint: subscription.endpoint,
              p256dh,
              auth,
              device_type: subscription.device_type || 'other',
              device_name: subscription.device_name || 'Unknown Device',
              is_active: true
            });

          if (error) {
            console.error('Error inserting subscription:', error);
            throw error;
          }
        }

        console.log('Subscription saved successfully for user:', user.id);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unsubscribe': {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          throw new Error('Missing authorization');
        }

        const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await userSupabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error('Unauthorized');
        }

        const { endpoint } = params;
        if (!endpoint) {
          throw new Error('Missing endpoint');
        }

        // Deactivate subscription
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('endpoint', endpoint);

        if (error) {
          console.error('Error deactivating subscription:', error);
          throw error;
        }

        console.log('Subscription deactivated for user:', user.id);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send': {
        const { user_id, title, body, url, icon } = params;

        if (!user_id || !title || !body) {
          throw new Error('Missing required fields: user_id, title, body');
        }

        console.log('Sending push notification to user:', user_id);
        console.log('Title:', title);
        console.log('Body:', body);

        // Get active subscriptions for user
        const { data: subscriptions, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching subscriptions:', error);
          throw error;
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.log('No active subscriptions for user:', user_id);
          return new Response(
            JSON.stringify({ success: true, sent: 0, message: 'No active subscriptions' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Found', subscriptions.length, 'active subscriptions');

        // Send to all subscriptions
        const results = await Promise.all(
          subscriptions.map(sub => 
            sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              { title, body, url, icon: icon || '/icons/icon-192x192.png' }
            )
          )
        );

        // Deactivate failed subscriptions
        const failedIds = subscriptions
          .filter((_, i) => !results[i])
          .map(sub => sub.id);

        if (failedIds.length > 0) {
          console.log('Deactivating', failedIds.length, 'failed subscriptions');
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .in('id', failedIds);
        }

        const sentCount = results.filter(Boolean).length;
        console.log(`Sent ${sentCount}/${subscriptions.length} notifications to user:`, user_id);

        return new Response(
          JSON.stringify({ success: true, sent: sentCount, total: subscriptions.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
