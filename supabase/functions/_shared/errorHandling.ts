/**
 * Shared Error Handling Utilities for Edge Functions
 * 
 * Provides standardized error handling and logging patterns
 * for consistent error management across all edge functions.
 */

import { errorResponse } from './responses.ts';

/**
 * Generate a unique error ID for tracking
 */
export const generateErrorId = (): string => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Log an error with context and return an error ID
 */
export const logError = (
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): string => {
  const errorId = generateErrorId();
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  console.error(`[${errorId}] ${context}:`, errorMessage, additionalInfo || '');
  
  // In production, you would send this to an error tracking service
  // await sendToErrorTracking({ errorId, context, error, additionalInfo });
  
  return errorId;
};

/**
 * Wrap an edge function handler with error handling
 * 
 * @example
 * ```ts
 * serve(withErrorHandling('my-function', async (req) => {
 *   // Your handler logic
 *   return jsonResponse({ data: 'hello' });
 * }));
 * ```
 */
export const withErrorHandling = (
  functionName: string,
  handler: (req: Request) => Promise<Response>
) => {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      const errorId = logError(functionName, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return errorResponse(
        `Internal error: ${message}`,
        500,
        { errorId }
      );
    }
  };
};

/**
 * Safe JSON parse with error handling
 */
export const safeParseJson = async <T>(
  req: Request
): Promise<{ data: T; error: null } | { data: null; error: string }> => {
  try {
    const data = await req.json() as T;
    return { data, error: null };
  } catch {
    return { data: null, error: 'Invalid JSON in request body' };
  }
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = <T extends Record<string, unknown>>(
  body: T,
  requiredFields: (keyof T)[]
): { valid: true } | { valid: false; missing: string[] } => {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(String(field));
    }
  }
  
  return missing.length === 0 
    ? { valid: true } 
    : { valid: false, missing };
};

/**
 * Type guard for Error objects
 */
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

/**
 * Extract error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isError(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
};
