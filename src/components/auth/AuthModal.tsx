// Compatibility wrapper - AuthModal is no longer a Dialog component.
// Authentication now routes through Supabase OAuth via AuthModalContext.
// This export exists only to prevent import errors from legacy references.
export const AuthModal = () => null;
