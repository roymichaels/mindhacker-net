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

// Create JWT for VAPID
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

  // Import private key
  const privateKeyData = base64UrlToUint8Array(VAPID_PRIVATE_KEY);
  const key = await crypto.subtle.importKey(
    'raw' as const,
    privateKeyData.buffer as ArrayBuffer,
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

  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string; icon?: string }
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await createVapidJwt(audience);

    const payloadString = JSON.stringify(payload);
    const payloadBytes = new TextEncoder().encode(payloadString);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'normal'
      },
      body: payloadBytes
    });

    if (response.status === 201 || response.status === 200) {
      console.log('Push notification sent successfully');
      return true;
    } else if (response.status === 410 || response.status === 404) {
      console.log('Subscription expired or invalid');
      return false;
    } else {
      console.error('Push notification failed:', response.status, await response.text());
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action, ...params } = await req.json();

    console.log('Push notification action:', action);

    switch (action) {
      case 'get-vapid-key': {
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

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          throw new Error('Unauthorized');
        }

        const { subscription } = params;
        if (!subscription?.endpoint || !subscription?.p256dh || !subscription?.auth) {
          throw new Error('Invalid subscription data');
        }

        // Upsert subscription
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
            device_type: subscription.device_type || 'other',
            device_name: subscription.device_name || 'Unknown Device',
            is_active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,endpoint'
          });

        if (error) {
          console.error('Error saving subscription:', error);
          throw error;
        }

        console.log('Subscription saved for user:', user.id);
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

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
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
        // This can be called internally from database triggers or with service role
        // Verify either service role or valid auth
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '') || '';
        
        // Check if it's a service role call or authorized user
        const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;
        if (!isServiceRole && authHeader) {
          const { data: { user }, error: authError } = await supabase.auth.getUser(token);
          if (authError || !user) {
            console.log('Send called without proper auth, allowing for internal trigger');
          }
        }

        const { user_id, title, body, url, icon } = params;

        if (!user_id || !title || !body) {
          throw new Error('Missing required fields: user_id, title, body');
        }

        console.log('Sending push notification to user:', user_id, 'Title:', title);

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
            JSON.stringify({ success: true, sent: 0 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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
        const failedEndpoints = subscriptions
          .filter((_, i) => !results[i])
          .map(sub => sub.endpoint);

        if (failedEndpoints.length > 0) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('user_id', user_id)
            .in('endpoint', failedEndpoints);
        }

        const sentCount = results.filter(Boolean).length;
        console.log(`Sent ${sentCount}/${subscriptions.length} notifications to user:`, user_id);

        return new Response(
          JSON.stringify({ success: true, sent: sentCount }),
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
