import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Settings, LogOut, BarChart3, Mail, CalendarDays, AlertTriangle, RefreshCw, CheckCircle, XCircle, ExternalLink, Info } from 'lucide-react';
import AdminOverview from './AdminOverview';
import EventTypesManager from './EventTypesManager';
import AvailabilityManager from './AvailabilityManager';
import BookingsManager from './BookingsManager';
import { NotificationsManager } from './NotificationsManager';
import AgendaView from './AgendaView';
import { resolveApiUrl } from '../utils/adminApi';

type AdminPage = 'overview' | 'event-types' | 'availability' | 'bookings' | 'agenda' | 'notifications';

interface AdminSchedulingLayoutProps {
  onLogout: () => void;
}

interface HealthStatus {
  ok: boolean;
  adminEnabled: boolean;
  hasCredentials: boolean;
  hasActionTokenSecret: boolean;
  db: {
    connected: boolean;
    tables: string[];
  };
  timestamp: string;
}

const AdminSchedulingLayout: React.FC<AdminSchedulingLayoutProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  // Check if API base URL looks incorrect for production
  const validateApiBaseUrl = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const currentHost = window.location.hostname;
    
    // If we're in production (not localhost) but API base URL contains localhost
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1' && 
        apiBaseUrl && apiBaseUrl.includes('localhost')) {
      return {
        isValid: false,
        current: apiBaseUrl,
        expected: `https://back.maxence.design/api`
      };
    }
    
    return { isValid: true };
  };

  // Trigger browser's HTTP Basic Auth prompt
  const triggerBasicAuth = () => {
    const loginUrl = resolveApiUrl('/admin/scheduling/login');
    // Open in new tab to trigger Basic Auth, then close it
    const authWindow = window.open(loginUrl, '_blank', 'width=400,height=300,scrollbars=yes,resizable=yes');
    
    // Check periodically if auth was successful
    const checkAuth = setInterval(() => {
      try {
        if (authWindow && authWindow.closed) {
          clearInterval(checkAuth);
          // Give a moment for cookies to be set, then retry
          setTimeout(() => {
            retryAuthentication();
          }, 500);
        }
      } catch (e) {
        // Cross-origin error means window is still open
      }
    }, 1000);
    
    // Fallback: close after 60 seconds
    setTimeout(() => {
      clearInterval(checkAuth);
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    }, 60000);
  };

  // Fetch health status from server
  const fetchHealthStatus = async () => {
    setIsLoadingHealth(true);
    try {
      const response = await fetch(resolveApiUrl('/admin/scheduling/health'));
      const health = await response.json();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus(null);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use cookie-based session; no frontend secrets
        const response = await fetch(resolveApiUrl('/admin/scheduling/overview'), {
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setIsAuthenticated(false);
          
          // Enhanced error handling for different response types
          const contentType = response.headers.get('content-type') || '';
          
          if (response.status === 401) {
            // Check if this is a JSON response or HTML redirect
            if (contentType.includes('application/json')) {
              try {
                const errorData = await response.json();
                setAuthError(errorData.error?.message || 'Authentication required');
              } catch {
                setAuthError('Authentication required');
              }
            } else {
              // Non-JSON response (likely HTML from proxy/server)
              setAuthError('HTTP Basic Authentication required. The server is not accepting browser sessions.');
            }
          } else if (!contentType.includes('application/json')) {
            // Server returned HTML instead of JSON
            const text = await response.text();
            const snippet = text.substring(0, 200);
            setAuthError(`Server returned HTML instead of JSON. This may indicate a proxy configuration issue. Response: ${snippet}...`);
          } else {
            try {
              const errorData = await response.json();
              setAuthError(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            } catch {
              setAuthError(`HTTP ${response.status}: ${response.statusText}`);
            }
          }
          
          // Always fetch health status when authentication fails
          fetchHealthStatus();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setAuthError('Unable to connect to admin API. Check your network connection.');
        } else {
          setAuthError('Unable to connect to admin API');
        }
        // Still try to get health status
        fetchHealthStatus();
      }
    };

    checkAuth();
  }, []);

  const renderHealthDiagnostics = () => {
    if (isLoadingHealth) {
      return (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-2" />
            <span className="text-blue-800">Checking system status...</span>
          </div>
        </div>
      );
    }

    if (!healthStatus) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">Unable to check system status</span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">System Diagnostics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Admin Panel:</span>
            <div className="flex items-center">
              {healthStatus.adminEnabled ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-800">Enabled</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-800">Disabled</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Credentials:</span>
            <div className="flex items-center">
              {healthStatus.hasCredentials ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-800">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-800">Missing</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Security Token:</span>
            <div className="flex items-center">
              {healthStatus.hasActionTokenSecret ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-800">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-800">Missing</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Database:</span>
            <div className="flex items-center">
              {healthStatus.db.connected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-800">Connected ({healthStatus.db.tables.length} tables)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-800">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {!healthStatus.adminEnabled && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-yellow-800">
                <strong>Admin panel is disabled.</strong><br />
                Contact your system administrator to set <code className="bg-yellow-100 px-1 py-0.5 rounded">ADMIN_ENABLED=true</code>.
              </div>
            </div>
          </div>
        )}
        
        {!healthStatus.hasCredentials && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-yellow-800">
                <strong>Admin credentials not configured.</strong><br />
                Contact your system administrator to set <code className="bg-yellow-100 px-1 py-0.5 rounded">ADMIN_USERNAME</code> and <code className="bg-yellow-100 px-1 py-0.5 rounded">ADMIN_PASSWORD</code>.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const retryAuthentication = async () => {
    setAuthError(null);
    setHealthStatus(null);
    
    try {
      // Use cookie-based session; no frontend secrets  
      const response = await fetch(resolveApiUrl('/admin/scheduling/overview'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setIsAuthenticated(false);
        
        // Enhanced error handling for retry
        const contentType = response.headers.get('content-type') || '';
        
        if (response.status === 401) {
          if (contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              setAuthError(errorData.error?.message || 'Authentication required');
            } catch {
              setAuthError('Authentication required');
            }
          } else {
            setAuthError('HTTP Basic Authentication required. The server is not accepting browser sessions.');
          }
        } else if (!contentType.includes('application/json')) {
          const text = await response.text();
          const snippet = text.substring(0, 200);
          setAuthError(`Server returned HTML instead of JSON. Response: ${snippet}...`);
        } else {
          try {
            const errorData = await response.json();
            setAuthError(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
          } catch {
            setAuthError(`HTTP ${response.status}: ${response.statusText}`);
          }
        }
        fetchHealthStatus();
      }
    } catch (error) {
      console.error('Auth retry failed:', error);
      setIsAuthenticated(false);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setAuthError('Unable to connect to admin API. Check your network connection.');
      } else {
        setAuthError('Unable to connect to admin API');
      }
      fetchHealthStatus();
    }
  };

  const navigation = [
    {
      id: 'overview' as AdminPage,
      name: 'Overview',
      icon: BarChart3,
      description: 'Dashboard and statistics'
    },
    {
      id: 'agenda' as AdminPage,
      name: 'Agenda',
      icon: CalendarDays,
      description: 'Calendar view'
    },
    {
      id: 'event-types' as AdminPage,
      name: 'Event Types',
      icon: Calendar,
      description: 'Manage meeting types'
    },
    {
      id: 'availability' as AdminPage,
      name: 'Availability',
      icon: Clock,
      description: 'Configure schedules'
    },
    {
      id: 'bookings' as AdminPage,
      name: 'Bookings',
      icon: Users,
      description: 'Manage appointments'
    },
    {
      id: 'notifications' as AdminPage,
      name: 'Notifications',
      icon: Mail,
      description: 'Email & reminders'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <AdminOverview isAuthenticated={isAuthenticated} />;
      case 'agenda':
        return <AgendaView isAuthenticated={isAuthenticated} />;
      case 'event-types':
        return <EventTypesManager isAuthenticated={isAuthenticated} />;
      case 'availability':
        return <AvailabilityManager isAuthenticated={isAuthenticated} />;
      case 'bookings':
        return <BookingsManager isAuthenticated={isAuthenticated} />;
      case 'notifications':
        return <NotificationsManager />;
      default:
        return <AdminOverview isAuthenticated={isAuthenticated} />;
    }
  };

  if (!isAuthenticated) {
    const apiUrlValidation = validateApiBaseUrl();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            
            {/* API Base URL Warning */}
            {!apiUrlValidation.isValid && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-yellow-800 text-sm">
                    <strong>API Base URL Configuration Warning</strong><br />
                    Current: <code className="bg-yellow-100 px-1 py-0.5 rounded">{apiUrlValidation.current}</code><br />
                    Expected: <code className="bg-yellow-100 px-1 py-0.5 rounded">{apiUrlValidation.expected}</code><br />
                    <span className="text-yellow-700">
                      Please update <code>VITE_API_BASE_URL</code> in your environment configuration.
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                <div className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-red-800 text-sm">
                    <strong>Authentication Error</strong><br />
                    {authError}
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              Cette interface d'administration nécessite une authentification HTTP Basic.
              Utilisez le bouton ci-dessous pour déclencher l'invite d'authentification de votre navigateur.
            </p>
            
            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={triggerBasicAuth}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Se connecter (Basic Auth)
              </button>
              
              <button
                onClick={retryAuthentication}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                Recharger la page
              </button>
            </div>
            
            {/* Health Diagnostics Toggle */}
            <div className="mt-6">
              <button
                onClick={() => setShowHealthDetails(!showHealthDetails)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center w-full"
              >
                <Info className="w-4 h-4 mr-1" />
                {showHealthDetails ? 'Masquer le diagnostic' : 'Voir le diagnostic'}
              </button>
            </div>
          </div>
          
          {/* Health diagnostics */}
          {showHealthDetails && renderHealthDiagnostics()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Scheduling Admin</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your calendar system</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default AdminSchedulingLayout;