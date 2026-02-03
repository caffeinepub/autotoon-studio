/**
 * Normalizes various error types into user-friendly English error messages
 */
export function normalizeError(error: unknown): string {
  if (typeof error === 'string') {
    // Map raw actor initialization errors
    if (error.includes('Actor not initialized')) {
      return 'System is initializing. Please wait a moment and try again.';
    }
    return error;
  }

  if (error instanceof Error) {
    // Extract backend error messages that might be wrapped
    const message = error.message;
    
    // Map raw actor initialization errors
    if (message.includes('Actor not initialized')) {
      return 'System is initializing. Please wait a moment and try again.';
    }
    
    // Check for common backend error patterns
    if (message.includes('Unauthorized')) {
      return 'Unauthorized: Please log in to continue';
    }
    
    if (message.includes('File not found')) {
      return 'File not found';
    }
    
    if (message.includes('already exists')) {
      return 'File already exists';
    }

    if (message.includes('placeholder')) {
      return message; // Preserve detailed placeholder error messages
    }
    
    // Return the original error message if it's already descriptive
    return message;
  }

  if (error && typeof error === 'object') {
    // Handle objects with message property
    if ('message' in error && typeof error.message === 'string') {
      return normalizeError(error.message);
    }
    
    // Handle objects with error property
    if ('error' in error) {
      return normalizeError(error.error);
    }
  }

  return 'An unexpected error occurred';
}
