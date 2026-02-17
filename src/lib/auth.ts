// Shared authentication utilities

// Allowed redirect paths to prevent open redirect vulnerabilities
export const ALLOWED_REDIRECT_PREFIXES = [
  '/today',
  '/plan',
  '/me',
  '/aurora',
  '/dashboard',
  '/courses',
  '/admin',
  '/panel',
  '/coach',
  '/affiliate',
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
 * @returns A safe redirect path (defaults to /today if invalid)
 */
export const validateRedirectPath = (redirect: string | null): string => {
  if (!redirect) return '/today';
  
  // Prevent protocol-relative URLs
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/today';
  }
  
  // Redirect legacy /dashboard to /today
  if (redirect === '/dashboard') return '/today';
  
  // Check against allowed prefixes
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(prefix => 
    redirect === prefix || 
    redirect.startsWith(prefix + '/') || 
    redirect.startsWith(prefix + '?')
  );
  
  return isAllowed ? redirect : '/today';
};
