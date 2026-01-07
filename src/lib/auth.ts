// Shared authentication utilities

// Allowed redirect paths to prevent open redirect vulnerabilities
export const ALLOWED_REDIRECT_PREFIXES = [
  '/dashboard',
  '/courses',
  '/admin',
  '/success',
  '/subscriptions',
  '/install',
  '/personal-hypnosis',
  '/consciousness-leap',
  '/'
];

/**
 * Validates a redirect path to prevent open redirect vulnerabilities
 * @param redirect - The redirect path to validate
 * @returns A safe redirect path (defaults to /dashboard if invalid)
 */
export const validateRedirectPath = (redirect: string | null): string => {
  if (!redirect) return '/dashboard';
  
  // Prevent protocol-relative URLs
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/dashboard';
  }
  
  // Check against allowed prefixes
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(prefix => 
    redirect === prefix || 
    redirect.startsWith(prefix + '/') || 
    redirect.startsWith(prefix + '?')
  );
  
  return isAllowed ? redirect : '/dashboard';
};
