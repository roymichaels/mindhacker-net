/**
 * Type Guards & Validation Utilities
 * 
 * Provides runtime type checking to improve type safety
 * and prevent common null/undefined access errors.
 */

/**
 * Checks if a value is non-null and non-undefined
 */
export const isNonNull = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

/**
 * Checks if an object has a specific property
 */
export const hasProperty = <T, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> =>
  obj !== null && typeof obj === 'object' && key in obj;

/**
 * Safely access a nested property with a default value
 */
export const getNestedValue = <T>(
  obj: unknown,
  path: string[],
  defaultValue: T
): T => {
  let current: unknown = obj;
  
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return (current as T) ?? defaultValue;
};

/**
 * Checks if a value is a valid string (non-empty)
 */
export const isValidString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Checks if a value is a valid number (not NaN)
 */
export const isValidNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

/**
 * Checks if a value is a valid array (non-empty)
 */
export const isNonEmptyArray = <T>(value: unknown): value is T[] =>
  Array.isArray(value) && value.length > 0;

/**
 * Checks if a value is a valid object (not null, not array)
 */
export const isValidObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Safely parse JSON with a default value
 */
export const safeJsonParse = <T>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Checks if a value is a valid UUID
 */
export const isValidUUID = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Checks if a value is a valid email
 */
export const isValidEmail = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Checks if a value is a valid date string
 */
export const isValidDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

/**
 * Asserts a condition and throws if false (for dev-time checks)
 */
export const assertDev = (condition: boolean, message: string): void => {
  if (import.meta.env.DEV && !condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};
