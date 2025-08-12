import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { formatErrorMessage, isAuthError, isNetworkError } from '../../utils/adminApi';

interface ErrorBannerProps {
  error: any;
  onRetry?: () => void;
  onAuthRedirect?: () => void;
  className?: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  error, 
  onRetry, 
  onAuthRedirect,
  className = '' 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!error) return null;

  const { message, details } = formatErrorMessage(error);
  const isAuth = isAuthError(error);
  const isNetwork = isNetworkError(error);

  // Handle authentication errors with redirect option
  const handleAuthError = () => {
    if (onAuthRedirect) {
      onAuthRedirect();
    } else {
      // Default: reload page to trigger re-authentication
      window.location.reload();
    }
  };

  // Determine banner style based on error type
  const getBannerStyle = () => {
    if (isAuth) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (isNetwork) return 'bg-blue-50 border-blue-200 text-blue-800';
    return 'bg-red-50 border-red-200 text-red-800';
  };

  const getIconColor = () => {
    if (isAuth) return 'text-yellow-600';
    if (isNetwork) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className={`border rounded-lg p-4 ${getBannerStyle()} ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
        <div className="flex-grow">
          <p className="font-medium">{message}</p>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-3 mt-3">
            {isAuth ? (
              <button
                onClick={handleAuthError}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors text-sm"
              >
                Se reconnecter
              </button>
            ) : onRetry ? (
              <button
                onClick={onRetry}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Réessayer
              </button>
            ) : null}
            
            {details && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Détails
                {showDetails ? (
                  <ChevronUp className="w-3 h-3 ml-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-1" />
                )}
              </button>
            )}
          </div>

          {/* Expandable details */}
          {showDetails && details && (
            <div className="mt-3 p-3 bg-white bg-opacity-50 rounded text-xs font-mono whitespace-pre-wrap">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;