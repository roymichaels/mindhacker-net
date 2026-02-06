import { toast } from "@/hooks/use-toast";
import { debug } from "./debug";

// Re-export generateErrorId for backwards compatibility
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
): string => {
  // Use the centralized debug.error which returns an error ID
  const errorId = debug.error(
    `Error${context ? ` in ${context}` : ''}:`,
    error
  );
  
  // Show user-friendly message with translated title
  toast({
    title: title || "Error",
    description: `${userMessage} (${errorId})`,
    variant: "destructive",
  });
  
  return errorId;
};
