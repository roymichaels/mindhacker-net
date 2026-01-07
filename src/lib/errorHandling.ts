import { toast } from "@/hooks/use-toast";

// Generate unique error ID for tracking
export const generateErrorId = (): string => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Centralized error handler with translation support
 * @param error - The error object
 * @param userMessage - User-friendly message (should be translated by caller)
 * @param context - Optional context for logging
 * @param title - Optional title (should be translated by caller, defaults to "Error")
 */
export const handleError = (
  error: unknown,
  userMessage: string,
  context?: string,
  title?: string
) => {
  const errorId = generateErrorId();
  
  // Log only error ID to console (not full error in production)
  if (import.meta.env.DEV) {
    console.error(`Error ${errorId}${context ? ` in ${context}` : ''}:`, error);
  } else {
    console.error(`Error ${errorId}${context ? ` in ${context}` : ''}`);
  }
  
  // In production, you would send this to a logging service
  // await logToServer({ errorId, message: error.message, stack: error.stack, context });
  
  // Show user-friendly message with translated title
  toast({
    title: title || "Error",
    description: `${userMessage} (${errorId})`,
    variant: "destructive",
  });
  
  return errorId;
};
