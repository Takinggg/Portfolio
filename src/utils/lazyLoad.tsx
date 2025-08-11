import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  retryDelay?: number;
}

/**
 * Enhanced lazy loading wrapper with error handling and loading states
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> => {
  const {
    fallback = <LoadingSkeleton />,
    errorFallback = LazyLoadErrorFallback,
    retryDelay = 1000
  } = options;

  const LazyComponent = React.lazy(() =>
    importFunc().catch(error => {
      console.error('Lazy loading failed:', error);
      
      // Retry after delay
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          importFunc()
            .then(resolve)
            .catch(reject);
        }, retryDelay);
      });
    })
  );

  const WrappedComponent: LazyExoticComponent<T> = React.forwardRef((props, ref) => (
    <ErrorBoundary fallback={<LazyLoadErrorFallback error={new Error('Component failed to load')} resetErrorBoundary={() => window.location.reload()} />}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </ErrorBoundary>
  )) as LazyExoticComponent<T>;

  WrappedComponent.displayName = `LazyLoad(${LazyComponent.displayName || 'Component'})`;

  return WrappedComponent;
};

/**
 * Default loading skeleton component
 */
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ 
  className = "w-full h-64" 
}) => (
  <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg`}>
    <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg" />
  </div>
);

/**
 * Error fallback for lazy loaded components
 */
export const LazyLoadErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="w-full p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
          Failed to load component
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error.message}
        </p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

/**
 * Preload a lazy component
 */
export const preloadComponent = <T extends ComponentType<any>>(
  lazyComponent: LazyExoticComponent<T>
): void => {
  // Force the component to load
  const componentImport = (lazyComponent as any)._payload?._result;
  if (!componentImport) {
    // Trigger the lazy loading
    try {
      lazyComponent({});
    } catch {
      // Expected error during preload
    }
  }
};

/**
 * Hook for conditional component loading
 */
export const useConditionalLoad = <T extends ComponentType<any>>(
  shouldLoad: boolean,
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> | null => {
  const [LazyComponent, setLazyComponent] = React.useState<LazyExoticComponent<T> | null>(null);

  React.useEffect(() => {
    if (shouldLoad && !LazyComponent) {
      const component = lazyLoad(importFunc, options);
      setLazyComponent(component);
    }
  }, [shouldLoad, importFunc, options, LazyComponent]);

  return LazyComponent;
};

/**
 * Specific loading skeletons for different component types
 */
export const ComponentSkeletons = {
  Card: () => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  ),

  List: () => (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),

  Chart: () => (
    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
      <div className="w-3/4 h-3/4 bg-gray-300 dark:bg-gray-600 rounded opacity-50" />
    </div>
  ),

  Form: () => (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      ))}
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
    </div>
  )
};