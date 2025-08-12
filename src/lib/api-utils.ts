/**
 * Utility functions for API error handling
 */

/**
 * Safely parse error response as JSON, handling cases where server returns HTML
 */
export const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return errorData.error || errorData.message || `Server error (${response.status})`;
    } else {
      // Server returned non-JSON (likely HTML error page)
      return `Server error (${response.status})`;
    }
  } catch (parseError) {
    // JSON parsing failed - server likely returned HTML
    return `Server error (${response.status})`;
  }
};

/**
 * Handle API response errors gracefully
 */
export const handleApiError = async (response: Response, defaultMessage?: string): Promise<never> => {
  const errorMessage = await parseErrorResponse(response);
  throw new Error(defaultMessage ? `${defaultMessage}: ${errorMessage}` : errorMessage);
};

/**
 * Safely parse JSON response, handling non-JSON responses
 */
export const safeJsonParse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    throw new Error(`Expected JSON response but got ${contentType}`);
  }
};