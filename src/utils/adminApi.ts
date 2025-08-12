/**
 * Admin API utilities - handles authentication and safe JSON parsing
 * Prevents SyntaxError when server returns HTML responses
 */

/**
 * Safe JSON parsing with content-type validation
 * Maps common HTTP status codes to i18n error keys
 */
export async function safeJson(response: Response): Promise<unknown> {
  // Check if response is ok first
  if (!response.ok) {
    // Map common status codes to i18n keys
    switch (response.status) {
      case 404:
        throw new Error('scheduling.errors.not_found');
      case 500:
      case 502:
      case 503:
        throw new Error('scheduling.errors.server_error');
      default:
        throw new Error('scheduling.errors.server_error');
    }
  }

  // Check content-type header
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('scheduling.errors.invalid_json');
  }

  try {
    return await response.json();
  } catch {
    // JSON parsing failed - server returned invalid JSON
    throw new Error('scheduling.errors.invalid_json');
  }
}

/**
 * Get admin authentication header only if both env vars are present
 * Returns empty object if either is missing to avoid "Basic undefined:undefined"
 */
export function getAdminAuthHeader(): Record<string, string> {
  const username = import.meta.env.VITE_ADMIN_USERNAME;
  const password = import.meta.env.VITE_ADMIN_PASSWORD;

  if (username && password && username.trim() && password.trim()) {
    return {
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`
    };
  }

  return {};
}

/**
 * Fetch JSON with proper headers and safe parsing
 * Automatically adds Accept header and admin auth if available
 */
export async function fetchJSON(url: string, init: RequestInit = {}): Promise<unknown> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Accept': 'application/json',
        ...getAdminAuthHeader(),
        ...init.headers,
      },
    });

    return await safeJson(response);
  } catch (error) {
    // Network errors or fetch failures
    if (error instanceof Error) {
      // If it's already an i18n key, pass it through
      if (error.message.startsWith('scheduling.errors.')) {
        throw error;
      }
      // Network error
      throw new Error('scheduling.errors.network');
    }
    // Unknown error
    throw new Error('scheduling.errors.generic');
  }
}

/**
 * POST JSON with proper headers and safe parsing
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