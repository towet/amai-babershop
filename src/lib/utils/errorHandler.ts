// Enhanced error handling for Supabase operations
export interface DatabaseError {
  status?: number;
  message: string;
  code?: string;
  details?: any;
}

export class ServiceUnavailableError extends Error {
  constructor(message: string = 'Database service is temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export function handleSupabaseError(error: any, operationName: string = 'Database operation'): never {
  console.error(`${operationName} failed:`, error);
  
  // Handle specific error types
  if (error?.status === 503) {
    throw new ServiceUnavailableError(
      `${operationName} failed: Database service is temporarily unavailable. Please try again in a few moments.`
    );
  }
  
  if (error?.status === 429) {
    throw new Error(`${operationName} failed: Too many requests. Please wait before trying again.`);
  }
  
  if (error?.status >= 500) {
    throw new Error(`${operationName} failed: Server error. Please try again later.`);
  }
  
  // Re-throw the original error for other cases
  throw error;
}

export function isRetryableError(error: any): boolean {
  return error?.status === 503 || error?.status === 429 || error?.status >= 500;
}

export function getErrorMessage(error: any): string {
  if (error instanceof ServiceUnavailableError) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
