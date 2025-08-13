/**
 * Tests for adminApi fetchJSON behavior
 * Tests various response scenarios to ensure robust error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchJSON, postJSON, patchJSON, deleteJSON, isAuthError, isNetworkError, formatErrorMessage, resolveApiUrl } from '../src/utils/adminApi';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables - no longer using VITE_ADMIN_*
vi.mock('meta', () => ({
  env: {
    // Session-based auth - no frontend credentials needed
  }
}));

describe('adminApi fetchJSON', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Successful JSON responses', () => {
    it('should handle successful JSON response', async () => {
      const mockData = { data: 'test', success: true };
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve(mockData)
      });

      const result = await fetchJSON('/api/test');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      }));
    });

    it('should handle 200 OK with valid JSON', async () => {
      const mockData = { eventTypes: [{ id: 1, name: 'Meeting' }] };
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json; charset=utf-8');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve(mockData)
      });

      const result = await fetchJSON('/api/admin/scheduling/event-types');
      expect(result).toEqual(mockData);
    });
  });

  describe('HTML error responses', () => {
    it('should handle HTML response with descriptive error', async () => {
      const htmlContent = '<html><body><h1>500 Internal Server Error</h1><p>Something went wrong</p></body></html>';
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'text/html; charset=UTF-8');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: mockHeaders,
        text: () => Promise.resolve(htmlContent)
      });

      await expect(fetchJSON('/api/test')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/test');
      } catch (error) {
        expect(error.message).toContain('Le serveur a retourné du text/html; charset=UTF-8 au lieu de JSON');
        expect(error.status).toBe(500);
        expect(error.contentType).toBe('text/html; charset=UTF-8');
        expect(error.responseSnippet).toContain('<html><body><h1>500 Internal Server Error</h1>');
      }
    });

    it('should handle 302 HTML redirect response', async () => {
      const htmlContent = '<html><head><title>Redirecting...</title></head><body>You are being redirected...</body></html>';
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'text/html');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 302,
        headers: mockHeaders,
        text: () => Promise.resolve(htmlContent)
      });

      await expect(fetchJSON('/api/admin/scheduling/overview')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/admin/scheduling/overview');
      } catch (error) {
        expect(error.status).toBe(302);
        expect(error.responseSnippet).toContain('You are being redirected...');
      }
    });
  });

  describe('Authentication errors (401/403)', () => {
    it('should handle 401 authentication error', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: mockHeaders,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      });

      await expect(fetchJSON('/api/admin/scheduling/overview')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/admin/scheduling/overview');
      } catch (error) {
        expect(error.message).toBe('Session expirée. Veuillez vous reconnecter.');
        expect(error.isAuthError).toBe(true);
        expect(error.status).toBe(401);
        expect(isAuthError(error)).toBe(true);
      }
    });

    it('should handle 403 forbidden error', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'text/html');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: mockHeaders,
        text: () => Promise.resolve('<html><body>Forbidden</body></html>')
      });

      await expect(fetchJSON('/api/admin/scheduling/bookings')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/admin/scheduling/bookings');
      } catch (error) {
        expect(error.message).toBe('Session expirée. Veuillez vous reconnecter.');
        expect(error.isAuthError).toBe(true);
        expect(error.status).toBe(403);
      }
    });
  });

  describe('400 JSON validation errors', () => {
    it('should handle 400 Bad Request with JSON error details', async () => {
      const errorResponse = {
        error: 'Validation failed',
        details: {
          field: 'email',
          message: 'Invalid email format'
        }
      };
      
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: mockHeaders,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(postJSON('/api/admin/scheduling/bookings', { email: 'invalid' })).rejects.toThrow();
      
      try {
        await postJSON('/api/admin/scheduling/bookings', { email: 'invalid' });
      } catch (error) {
        expect(error.message).toBe('Validation failed');
        expect(error.status).toBe(400);
      }
    });
  });

  describe('Invalid JSON responses', () => {
    it('should handle malformed JSON response', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.reject(new SyntaxError('Unexpected token'))
      });

      await expect(fetchJSON('/api/test')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/test');
      } catch (error) {
        expect(error.message).toBe('Réponse JSON invalide du serveur');
        expect(error.status).toBe(200);
        expect(error.contentType).toBe('application/json');
      }
    });

    it('should handle successful response with non-JSON content-type', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'text/plain');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        text: () => Promise.resolve('Plain text response')
      });

      await expect(fetchJSON('/api/test')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/test');
      } catch (error) {
        expect(error.message).toBe('Réponse JSON attendue mais reçu text/plain');
        expect(error.responseSnippet).toBe('Plain text response');
      }
    });
  });

  describe('Network errors', () => {
    it('should handle network connection failures', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchJSON('/api/test')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/test');
      } catch (error) {
        expect(error.message).toBe('Erreur de connexion. Vérifiez votre connexion internet.');
        expect(error.isNetworkError).toBe(true);
        expect(isNetworkError(error)).toBe(true);
      }
    });

    it('should handle DNS resolution failures', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('NetworkError when attempting to fetch resource'));

      await expect(fetchJSON('/api/test')).rejects.toThrow();
      
      try {
        await fetchJSON('/api/test');
      } catch (error) {
        expect(error.isNetworkError).toBe(true);
        expect(error.message).toBe('Erreur de connexion. Vérifiez votre connexion internet.');
      }
    });
  });

  describe('HTTP methods', () => {
    it('should handle POST requests with JSON body', async () => {
      const mockData = { success: true, id: 123 };
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: mockHeaders,
        json: () => Promise.resolve(mockData)
      });

      const requestData = { name: 'Test Event', duration: 30 };
      const result = await postJSON('/api/admin/scheduling/event-types', requestData);
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/scheduling/event-types', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });

    it('should handle PATCH requests', async () => {
      const mockData = { success: true };
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve(mockData)
      });

      const result = await patchJSON('/api/admin/scheduling/event-types/1', { name: 'Updated' });
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/scheduling/event-types/1', expect.objectContaining({
        method: 'PATCH'
      }));
    });

    it('should handle DELETE requests', async () => {
      const mockData = { success: true };
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve(mockData)
      });

      const result = await deleteJSON('/api/admin/scheduling/event-types/1');
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/scheduling/event-types/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });

  describe('Credentials and headers', () => {
    it('should always include credentials', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve({})
      });

      await fetchJSON('/api/test');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        credentials: 'include'
      }));
    });

    it('should include proper Accept header', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve({})
      });

      await fetchJSON('/api/test');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/json'
        })
      }));
    });
  });

  describe('Error message formatting', () => {
    it('should format API errors with details', () => {
      const apiError = {
        message: 'Validation failed',
        status: 400,
        url: '/api/test',
        contentType: 'application/json',
        responseSnippet: '{"error":"Validation failed"}'
      };

      const { message, details } = formatErrorMessage(apiError);
      
      expect(message).toBe('Validation failed');
      expect(details).toContain('Status: 400');
      expect(details).toContain('URL: /api/test');
      expect(details).toContain('Content-Type: application/json');
    });

    it('should format network errors without details', () => {
      const networkError = {
        message: 'Network error',
        isNetworkError: true
      };

      const { message, details } = formatErrorMessage(networkError);
      
      expect(message).toBe('Network error');
      expect(details).toBeUndefined();
    });

    it('should handle generic Error objects', () => {
      const error = new Error('Generic error');

      const { message, details } = formatErrorMessage(error);
      
      expect(message).toBe('Generic error');
      expect(details).toBeUndefined();
    });
  });

  describe('URL resolution', () => {
    it('should not duplicate /api prefix for absolute API paths', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve({ data: 'test' })
      });

      await fetchJSON('/api/admin/scheduling/overview');
      
      // Should call fetch with the same path (no duplication)
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/scheduling/overview', expect.any(Object));
    });

    it('should handle fully qualified URLs unchanged', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve({ data: 'test' })
      });

      await fetchJSON('https://example.com/api/test');
      
      // Should call fetch with the same URL
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test', expect.any(Object));
    });

    it('should prefix relative paths with /api', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/json');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve({ data: 'test' })
      });

      await fetchJSON('admin/scheduling/overview');
      
      // Should call fetch with /api prefix added
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/scheduling/overview', expect.any(Object));
    });

    it('should handle resolveApiUrl function directly', () => {
      // Test absolute paths starting with /api/
      expect(resolveApiUrl('/api/admin/scheduling/overview')).toBe('/api/admin/scheduling/overview');
      
      // Test fully qualified URLs
      expect(resolveApiUrl('https://example.com/api/test')).toBe('https://example.com/api/test');
      expect(resolveApiUrl('http://localhost:3001/api/test')).toBe('http://localhost:3001/api/test');
      
      // Test relative paths
      expect(resolveApiUrl('admin/scheduling/overview')).toBe('/api/admin/scheduling/overview');
      expect(resolveApiUrl('test')).toBe('/api/test');
      
      // Test other absolute paths
      expect(resolveApiUrl('/other/path')).toBe('/other/path');
    });
  });
});