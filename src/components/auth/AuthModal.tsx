// Compatibility wrapper — AuthModal is no longer a Dialog component.
// The auth flow now triggers the Web3Auth SDK modal directly via AuthModalContext.
// This export exists only to prevent import errors from legacy references.
export const AuthModal = () => null;
