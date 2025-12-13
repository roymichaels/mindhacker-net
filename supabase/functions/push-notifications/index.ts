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

// Base64URL encoding/decoding utilities
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper to get ArrayBuffer from Uint8Array
function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

// HKDF implementation for key derivation
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const saltBuffer = salt.length > 0 ? toArrayBuffer(salt) : new ArrayBuffer(32);
  const key = await crypto.subtle.importKey(
    'raw',
    saltBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const prk = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, toArrayBuffer(ikm))
  );
  
  const prkKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(prk),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;
  
  const okm = new Uint8Array(
    await crypto.subtle.sign('HMAC', prkKey, toArrayBuffer(infoWithCounter))
  );
  
  return okm.slice(0, length);
}

// Create info for HKDF
function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const info = new Uint8Array(
    18 + typeBytes.length + 1 + 5 + 1 + 2 + clientPublicKey.length + 2 + serverPublicKey.length
  );
  
  let offset = 0;
  
  const contentEncoding = new TextEncoder().encode('Content-Encoding: ');
  info.set(contentEncoding, offset);
  offset += contentEncoding.length;
  
  info.set(typeBytes, offset);
  offset += typeBytes.length;
  
  info[offset++] = 0;
  
  const p256 = new TextEncoder().encode('P-256');
  info.set(p256, offset);
  offset += p256.length;
  
  info[offset++] = 0;
  
  info[offset++] = 0;
  info[offset++] = clientPublicKey.length;
  
  info.set(clientPublicKey, offset);
  offset += clientPublicKey.length;
  
  info[offset++] = 0;
  info[offset++] = serverPublicKey.length;
  
  info.set(serverPublicKey, offset);
  
  return info;
}

// Encrypt payload for Web Push
async function encryptPayload(
  payload: string,
  clientPublicKeyBase64: string,
  clientAuthBase64: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const payloadBytes = new TextEncoder().encode(payload);
  const clientPublicKey = base64UrlToUint8Array(clientPublicKeyBase64);
  const clientAuth = base64UrlToUint8Array(clientAuthBase64);
  
  // Generate server ECDH key pair
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  
  // Export server public key
  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)
  );
  
  // Import client public key
  const clientPublicKeyObj = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(clientPublicKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  
  // Derive shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientPublicKeyObj },
      serverKeyPair.privateKey,
      256
    )
  );
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive PRK using auth secret
  const authInfo = new TextEncoder().encode('Content-Encoding: auth\0');
  const prk = await hkdf(clientAuth, sharedSecret, authInfo, 32);
  
  // Derive content encryption key
  const cekInfo = createInfo('aesgcm', clientPublicKey, serverPublicKeyRaw);
  const cek = await hkdf(salt, prk, cekInfo, 16);
  
  // Derive nonce
  const nonceInfo = createInfo('nonce', clientPublicKey, serverPublicKeyRaw);
  const nonce = await hkdf(salt, prk, nonceInfo, 12);
  
  // Add padding (2 bytes for padding length + actual padding)
  const paddingLength = 0;
  const paddedPayload = new Uint8Array(2 + paddingLength + payloadBytes.length);
  paddedPayload[0] = (paddingLength >> 8) & 0xff;
  paddedPayload[1] = paddingLength & 0xff;
  paddedPayload.set(payloadBytes, 2 + paddingLength);
  
  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(cek),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(nonce) },
      aesKey,
      toArrayBuffer(paddedPayload)
    )
  );
  
  return { ciphertext, salt, serverPublicKey: serverPublicKeyRaw };
}

// Create VAPID JWT
async function createVapidJwt(audience: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: 'mailto:admin@mind-hacker.net'
  };

  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Create JWK from VAPID keys
  const publicKeyBytes = base64UrlToUint8Array(VAPID_PUBLIC_KEY);
  
  // For P-256, the public key in raw format is 65 bytes (04 || x || y)
  const x = uint8ArrayToBase64Url(publicKeyBytes.slice(1, 33));
  const y = uint8ArrayToBase64Url(publicKeyBytes.slice(33, 65));
  const d = VAPID_PRIVATE_KEY;

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x,
    y,
    d,
  };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification with proper encryption
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string; icon?: string }
): Promise<boolean> {
  try {
    console.log('Sending push to:', subscription.endpoint);
    
    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: payload.url || '/dashboard' }
    });
    
    // Encrypt the payload
    const { ciphertext, salt, serverPublicKey } = await encryptPayload(
      payloadString,
      subscription.p256dh,
      subscription.auth
    );
    
    // Create VAPID authorization
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await createVapidJwt(audience);
    
    // Build the encrypted body with headers
    // Format: salt (16) || rs (4) || idlen (1) || keyid (65) || ciphertext
    const rs = 4096;
    const body = new Uint8Array(16 + 4 + 1 + serverPublicKey.length + ciphertext.length);
    let offset = 0;
    
    body.set(salt, offset);
    offset += 16;
    
    body[offset++] = (rs >> 24) & 0xff;
    body[offset++] = (rs >> 16) & 0xff;
    body[offset++] = (rs >> 8) & 0xff;
    body[offset++] = rs & 0xff;
    
    body[offset++] = serverPublicKey.length;
    
    body.set(serverPublicKey, offset);
    offset += serverPublicKey.length;
    
    body.set(ciphertext, offset);
    
    console.log('Encrypted payload size:', body.length);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'high'
      },
      body
    });

    console.log('Push response status:', response.status);

    if (response.status === 201 || response.status === 200) {
      console.log('Push notification sent successfully!');
      return true;
    } else if (response.status === 410 || response.status === 404) {
      console.log('Subscription expired or invalid');
      return false;
    } else {
      const responseText = await response.text();
      console.error('Push failed:', response.status, responseText);
      return false;
    }
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

serve(async (req) => {
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
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          throw new Error('Missing authorization');
        }

        const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await userSupabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          throw new Error('Unauthorized');
        }

        const { subscription } = params;
        console.log('Subscription data:', JSON.stringify(subscription));
        
        if (!subscription?.endpoint) {
          throw new Error('Missing endpoint');
        }
        
        const p256dh = subscription.keys?.p256dh || subscription.p256dh;
        const auth = subscription.keys?.auth || subscription.auth;
        
        if (!p256dh || !auth) {
          throw new Error('Missing keys');
        }

        console.log('Saving subscription for user:', user.id);

        const { data: existing } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .single();

        if (existing) {
          await supabase
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
        } else {
          await supabase
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

        await supabase
          .from('push_subscriptions')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('endpoint', endpoint);

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

        console.log('Sending push to user:', user_id);
        console.log('Title:', title);
        console.log('Body:', body);

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

        const results = await Promise.all(
          subscriptions.map(sub => 
            sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              { title, body, url, icon: icon || '/icons/icon-192x192.png' }
            )
          )
        );

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
        console.log(`Sent ${sentCount}/${subscriptions.length} notifications`);

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
