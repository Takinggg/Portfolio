/**
 * Admin API utilities - handles authentication and safe JSON parsing
 * Prevents SyntaxError when server returns HTML responses
 */

export interface ApiError {
  message: string;
  status?: number;
  url?: string;
  contentType?: string;
  responseSnippet?: string;
  isAuthError?: boolean;
  isNetworkError?: boolean;
}

/**
 * Resolve API URL to avoid duplicated "/api" prefixes
 * - If url is fully qualified (http/https), return unchanged
 * - If url is absolute (starts with '/'), return unchanged  
 * - If url is relative, prefix with '/api'
 */
export function resolveApiUrl(url: string): string {
  try {
    // Return fully qualified URLs unchanged
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    
    // Return absolute paths unchanged (including /api/... paths)
    if (url.startsWith('/')) {
      return url;
    }
    
    // For relative paths, prefix with '/api' (or VITE_API_BASE_URL if set)
    const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const apiBase = base || '/api';
    const normalizedBase = apiBase.replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  } catch {
    return url;
  }
}

/**
 * Safe JSON parsing with enhanced error handling and debugging info
 * Maps common HTTP status codes to user-friendly messages
 */
export async function safeJson(response: Response, url?: string): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  
  // Handle authentication errors (401/403) specially
  if (response.status === 401 || response.status === 403) {
    const error: ApiError = {
      message: 'Session expirée. Veuillez vous reconnecter.',
      status: response.status,
      url,
      contentType,
      isAuthError: true
    };
    throw error;
  }

  // If response is not ok, try to extract error details
  if (!response.ok) {
    let errorMessage = `Erreur serveur (${response.status})`;
    let responseSnippet = '';
    
    try {
      if (contentType.includes('application/json')) {
        const errorData = await response.json() as any;
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        // Server returned HTML or other non-JSON content
        const textContent = await response.text();
        responseSnippet = textContent.substring(0, 200);
        errorMessage = `Le serveur a retourné du ${contentType} au lieu de JSON`;
      }
    } catch {
      // Failed to read response body
      errorMessage = `Erreur serveur (${response.status}) - réponse illisible`;
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      url,
      contentType,
      responseSnippet
    };
    
    // Map specific status codes to user-friendly messages
    switch (response.status) {
      case 404:
        error.message = 'Ressource non trouvée';
        break;
      case 500:
      case 502:
      case 503:
        error.message = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
        break;
    }
    
    throw error;
  }

  // Check content-type header for successful responses
  if (!contentType.includes('application/json')) {
    const textContent = await response.text();
    const responseSnippet = textContent.substring(0, 200);
    
    const error: ApiError = {
      message: `Réponse JSON attendue mais reçu ${contentType}`,
      status: response.status,
      url,
      contentType,
      responseSnippet
    };
    throw error;
  }

  try {
    return await response.json();
  } catch {
    // JSON parsing failed - server returned invalid JSON
    const error: ApiError = {
      message: 'Réponse JSON invalide du serveur',
      status: response.status,
      url,
      contentType
    };
    throw error;
  }
}

/**
 * DEPRECATED: getAdminAuthHeader
 * We no longer inject Basic Auth credentials from VITE_* into frontend requests,
 * because anything prefixed with VITE_ is bundled client-side. The admin now
 * authenticates via login flow and relies on cookie-based session (credentials: 'include').
 * This function remains for backward compatibility and returns an empty object.
 */
export function getAdminAuthHeader(): Record<string, string> {
  return {};
}

/**
 * Fetch JSON with proper headers and comprehensive error handling
 * Automatically adds Accept header and credentials for session handling
 */
export async function fetchJSON(url: string, init: RequestInit = {}): Promise<unknown> {
  const finalUrl = resolveApiUrl(url);
  try {
    const response = await fetch(finalUrl, {
      credentials: 'include', // Always include credentials for session handling
      ...init,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // getAdminAuthHeader() intentionally returns {} now
        ...getAdminAuthHeader(),
        ...init.headers,
      },
    });

    return await safeJson(response, finalUrl);
  } catch (error) {
    // Check if it's already our enhanced ApiError
    if (error && typeof error === 'object' && 'isAuthError' in (error as any)) {
      throw error;
    }
    
    // Network errors or fetch failures
    if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
      const networkError: ApiError = {
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        url: finalUrl,
        isNetworkError: true
      };
      throw networkError;
    }
    
    // Re-throw other errors as ApiError
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      url: finalUrl
    };
    throw apiError;
  }
}

/**
 * POST JSON with proper headers, authentication, and comprehensive error handling
 * For POST requests with JSON body
 */
export async function postJSON(url: string, data: unknown, init: RequestInit = {}): Promise<unknown> {
  return fetchJSON(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: JSON.stringify(data),
    ...init,
  });
}

/**
 * PATCH JSON for updates
 */
export async function patchJSON(url: string, data: unknown, init: RequestInit = {}): Promise<unknown> {
  return fetchJSON(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: JSON.stringify(data),
    ...init,
  });
}

/**
 * DELETE with proper headers and authentication
 */
export async function deleteJSON(url: string, init: RequestInit = {}): Promise<unknown> {
  return fetchJSON(url, {
    method: 'DELETE',
    ...init,
  });
}

/**
 * Utility function to check if an error is an authentication error
 */
export function isAuthError(error: unknown): error is ApiError {
  return error !== null && typeof error === 'object' && (error as ApiError).isAuthError === true;
}

/**
 * Utility function to check if an error is a network error
 */
export function isNetworkError(error: unknown): error is ApiError {
  return error !== null && typeof error === 'object' && (error as ApiError).isNetworkError === true;
}

/**
 * Format error message for display with optional details
 */
export function formatErrorMessage(error: unknown): { message: string; details?: string } {
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError;
    const details = [
      apiError.status && `Status: ${apiError.status}`,
      apiError.url && `URL: ${apiError.url}`,
      apiError.contentType && `Content-Type: ${apiError.contentType}`,
      apiError.responseSnippet && `Response: ${apiError.responseSnippet}`
    ].filter(Boolean).join('\n');
    
    return {
      message: apiError.message,
      details: details || undefined
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'Erreur inconnue'
  };
}