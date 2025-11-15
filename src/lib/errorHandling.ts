import { toast } from "@/hooks/use-toast";

// Generate unique error ID for tracking
export const generateErrorId = (): string => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Centralized error handler
export const handleError = (
  error: any,
  userMessage: string,
  context?: string
) => {
  const errorId = generateErrorId();
  
  // Log only error ID to console (not full error)
  console.error(`Error ${errorId}${context ? ` in ${context}` : ''}`);
  
  // In production, you would send this to a logging service
  // await logToServer({ errorId, message: error.message, stack: error.stack, context });
  
  // Show user-friendly message
  toast({
    title: "שגיאה",
    description: `${userMessage} (${errorId})`,
    variant: "destructive",
  });
  
  return errorId;
};
