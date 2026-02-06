/**
 * Shared Response Utilities for Edge Functions
 * 
 * Provides standardized response helpers for consistent API responses
 * across all edge functions.
 */

import { corsHeaders } from './cors.ts';

/**
 * Create a JSON response with CORS headers
 */
export const jsonResponse = <T>(
  data: T,
  status = 200,
  additionalHeaders: Record<string, string> = {}
): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  });
};

/**
 * Create an error response with CORS headers
 */
export const errorResponse = (
  message: string,
  status = 500,
  additionalData?: Record<string, unknown>
): Response => {
  return jsonResponse(
    {
      error: message,
      timestamp: Date.now(),
      ...additionalData,
    },
    status
  );
};

/**
 * Create a success response with optional data
 */
export const successResponse = <T>(
  data?: T,
  message = 'Success'
): Response => {
  return jsonResponse({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

/**
 * Create an unauthorized response
 */
export const unauthorizedResponse = (
  message = 'Unauthorized'
): Response => {
  return errorResponse(message, 401);
};

/**
 * Create a forbidden response
 */
export const forbiddenResponse = (
  message = 'Forbidden'
): Response => {
  return errorResponse(message, 403);
};

/**
 * Create a not found response
 */
export const notFoundResponse = (
  message = 'Not found'
): Response => {
  return errorResponse(message, 404);
};

/**
 * Create a bad request response
 */
export const badRequestResponse = (
  message = 'Bad request',
  details?: unknown
): Response => {
  return errorResponse(message, 400, details ? { details } : undefined);
};

/**
 * Create a validation error response
 */
export const validationErrorResponse = (
  errors: string[]
): Response => {
  return jsonResponse(
    {
      error: 'Validation failed',
      errors,
      timestamp: Date.now(),
    },
    400
  );
};

/**
 * Create a binary response (for audio, files, etc.)
 */
export const binaryResponse = (
  data: ArrayBuffer | Uint8Array,
  contentType: string,
  additionalHeaders: Record<string, string> = {}
): Response => {
  return new Response(data, {
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Length': data.byteLength.toString(),
      ...additionalHeaders,
    },
  });
};

/**
 * Create an audio response
 */
export const audioResponse = (
  data: ArrayBuffer | Uint8Array,
  format = 'audio/mpeg'
): Response => {
  return binaryResponse(data, format);
};

/**
 * Create a fallback response (for TTS fallback to browser, etc.)
 */
export const fallbackResponse = (
  message: string,
  additionalData?: Record<string, unknown>
): Response => {
  return jsonResponse({
    fallback: true,
    message,
    ...additionalData,
  });
};

/**
 * Create a rate limited response
 */
export const rateLimitedResponse = (
  retryAfterSeconds = 60
): Response => {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': retryAfterSeconds.toString(),
      },
    }
  );
};
