import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  credentials: AdminCredentials | null;
  isLoading: boolean;
  error: string | null;
}

interface AdminAuthActions {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  authorizedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

type AdminAuthContextType = AdminAuthState & AdminAuthActions;

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const SESSION_KEY = 'adminAuth';

interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * AdminAuthProvider - Centralizes admin authentication state and logic
 * 
 * Features:
 * - Session-only credential storage (sessionStorage, not localStorage)
 * - Automatic 401 handling with logout
 * - Centralized fetch helper with automatic Basic Auth headers
 * - French error messages
 */
export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    credentials: null,
    isLoading: true,
    error: null,
  });

  // Restore session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem(SESSION_KEY);
    if (savedAuth) {
      try {
        const credentials: AdminCredentials = JSON.parse(savedAuth);
        // Validate credentials by making a test request
        validateCredentials(credentials);
      } catch (error) {
        console.warn('Invalid saved auth data, clearing session');
        sessionStorage.removeItem(SESSION_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const validateCredentials = async (credentials: AdminCredentials) => {
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        }
      });

      if (response.ok) {
        setState({
          isAuthenticated: true,
          credentials,
          isLoading: false,
          error: null,
        });
      } else {
        // Invalid credentials, clear session
        sessionStorage.removeItem(SESSION_KEY);
        setState({
          isAuthenticated: false,
          credentials: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      // Network error, don't clear session but mark as not authenticated
      setState({
        isAuthenticated: false,
        credentials: null,
        isLoading: false,
        error: 'Erreur réseau. Vérifiez votre connexion.',
      });
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const credentials = { username, password };
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        }
      });

      if (response.ok) {
        // Save to sessionStorage
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(credentials));
        setState({
          isAuthenticated: true,
          credentials,
          isLoading: false,
          error: null,
        });
        return true;
      } else if (response.status === 401) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Identifiants incorrects',
        }));
        return false;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur serveur. Veuillez réessayer.',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur de connexion. Vérifiez votre réseau.',
      }));
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setState({
      isAuthenticated: false,
      credentials: null,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const authorizedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!state.credentials) {
      throw new Error('Non authentifié');
    }

    const authHeader = `Basic ${btoa(`${state.credentials.username}:${state.credentials.password}`)}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': authHeader,
      },
    });

    // Handle 401 responses by automatically logging out
    if (response.status === 401) {
      logout();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    return response;
  };

  const contextValue: AdminAuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    authorizedFetch,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

/**
 * Hook to use admin authentication context
 * @throws Error if used outside AdminAuthProvider
 */
export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

/**
 * Helper hook for making authorized API requests
 * Automatically includes auth headers and handles 401 responses
 */
export const useAuthorizedFetch = () => {
  const { authorizedFetch } = useAdminAuth();
  return authorizedFetch;
};