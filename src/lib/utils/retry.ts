// Retry utility for handling database failures
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        break;
      }
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      // Calculate delay with optional exponential backoff
      const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      // Add some jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * currentDelay;
      const finalDelay = currentDelay + jitter;
      
      console.warn(`Attempt ${attempt} failed, retrying in ${Math.round(finalDelay)}ms...`, error);
      
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  throw lastError;
}

// Specific retry for Supabase operations
export async function withSupabaseRetry<T>(
  fn: () => Promise<T>,
  operationName: string = 'Supabase operation'
): Promise<T> {
  return withRetry(fn, {
    maxAttempts: 3,
    delay: 2000,
    backoff: true,
    onRetry: (attempt, error) => {
      console.warn(`${operationName} failed (attempt ${attempt}):`, {
        status: error?.status,
        message: error?.message,
        code: error?.code
      });
    }
  });
}
