// Enhanced authentication service with JWT refresh tokens and security features
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  permissions?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';
  private refreshTimer?: NodeJS.Timeout;

  constructor() {
    this.initializeTokenRefresh();
  }

  // Initialize automatic token refresh
  private initializeTokenRefresh() {
    const token = this.getAccessToken();
    if (token) {
      const expiresAt = this.getTokenExpiration(token);
      if (expiresAt) {
        this.scheduleTokenRefresh(expiresAt);
      }
    }
  }

  // Extract expiration time from JWT token
  private getTokenExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  // Schedule token refresh before expiration
  private scheduleTokenRefresh(expiresAt: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const timeUntilRefresh = Math.max(0, expiresAt - now - 5 * 60 * 1000); // Refresh 5 minutes before expiry

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, timeUntilRefresh);
  }

  // Store authentication tokens
  setTokens(tokens: AuthTokens) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    
    if (tokens.expiresAt) {
      this.scheduleTokenRefresh(tokens.expiresAt);
    } else {
      const expiresAt = this.getTokenExpiration(tokens.accessToken);
      if (expiresAt) {
        this.scheduleTokenRefresh(expiresAt);
      }
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Store user data
  setUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get current user
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const expiresAt = this.getTokenExpiration(token);
    if (!expiresAt) return true; // Assume valid if no expiration

    return Date.now() < expiresAt;
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await fetch(`${this.getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.data?.token) {
        this.setTokens({
          accessToken: data.data.token,
          refreshToken: data.data.refreshToken || refreshToken,
        });
        return true;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  // Sign in with credentials
  async signIn(username: string, password: string): Promise<{ data: AuthResponse | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      if (data.data) {
        this.setTokens({
          accessToken: data.data.token,
          refreshToken: data.data.refreshToken,
        });
        this.setUser(data.data.user);
        
        toast.success('Connexion réussie!');
        return { data: data.data, error: null };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      toast.error(errorMessage);
      return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  // Sign out and clear all auth data
  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    toast.success('Déconnexion réussie');
  }

  // Get API base URL
  private getApiBaseUrl(): string {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.startsWith('192.168.');
    
    const envApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envApiUrl) {
      return envApiUrl;
    }
    
    return isDevelopment 
      ? 'http://localhost:3001/api'
      : 'https://portfolio-backend-latest.onrender.com/api';
  }

  // Get authorization header for API requests
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Make authenticated API request with auto-retry on token expiry
  async authenticatedRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    const makeRequest = async (): Promise<Response> => {
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });
    };

    try {
      let response = await makeRequest();

      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && this.getRefreshToken()) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          response = await makeRequest();
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data: data.data || data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Request failed') 
      };
    }
  }
}

export const authService = new AuthService();
export default authService;