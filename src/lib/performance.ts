/**
 * Performance monitoring utilities for Core Web Vitals and other metrics
 */

// Types for Web Vitals metrics
interface Metric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

interface WebVitalsMetrics {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
}

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: WebVitalsMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Only initialize in browsers that support the APIs
    if (typeof window === 'undefined') return;

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };

        if (lastEntry) {
          const value = lastEntry.renderTime || lastEntry.loadTime || 0;
          this.metrics.LCP = value;
          this.reportMetric('LCP', value);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = entry as PerformanceEntry & { processingStart?: number };
          if (fid.processingStart) {
            const value = fid.processingStart - entry.startTime;
            this.metrics.FID = value;
            this.reportMetric('FID', value);
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          
          if (!layoutShift.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue &&
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += layoutShift.value || 0;
              sessionEntries.push(entry);
            } else {
              sessionValue = layoutShift.value || 0;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.metrics.CLS = clsValue;
              this.reportMetric('CLS', clsValue);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }

  /**
   * Observe First Contentful Paint (FCP)
   */
  private observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          const value = fcpEntry.startTime;
          this.metrics.FCP = value;
          this.reportMetric('FCP', value);
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation failed:', error);
    }
  }

  /**
   * Observe Time to First Byte (TTFB)
   */
  private observeTTFB() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navigation = entry as PerformanceEntry & { responseStart?: number };
          if (navigation.responseStart) {
            const value = navigation.responseStart - entry.startTime;
            this.metrics.TTFB = value;
            this.reportMetric('TTFB', value);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTFB observation failed:', error);
    }
  }

  /**
   * Report metric to console and external services
   */
  private reportMetric(name: string, value: number) {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance Metric - ${name}:`, {
        value: Math.round(value),
        rating: this.getRating(name, value),
        threshold: this.getThreshold(name)
      });
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, DataDog, etc.
      this.sendToAnalytics(name, value);
    }
  }

  /**
   * Get performance rating based on Core Web Vitals thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = this.getThreshold(name);
    
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get performance thresholds for each metric
   */
  private getThreshold(name: string) {
    const thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 }
    };

    return thresholds[name as keyof typeof thresholds] || { good: 0, needsImprovement: 0 };
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(name: string, value: number) {
    // Example implementation for Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true
      });
    }

    // Example for custom analytics endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value: Math.round(value),
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Silently fail - performance monitoring shouldn't break the app
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const metrics = this.getMetrics();
    const summary = {
      overall: 'good' as 'good' | 'needs-improvement' | 'poor',
      metrics: Object.entries(metrics).map(([name, value]) => ({
        name,
        value: Math.round(value),
        rating: this.getRating(name, value)
      }))
    };

    // Determine overall rating
    const ratings = summary.metrics.map(m => m.rating);
    if (ratings.includes('poor')) {
      summary.overall = 'poor';
    } else if (ratings.includes('needs-improvement')) {
      summary.overall = 'needs-improvement';
    }

    return summary;
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for performance monitoring in React components
 */
export const usePerformanceMonitor = () => {
  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getSummary: () => performanceMonitor.getPerformanceSummary()
  };
};

/**
 * Performance utilities
 */
export const performanceUtils = {
  /**
   * Mark a performance point
   */
  mark: (name: string) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  },

  /**
   * Measure time between two marks
   */
  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        return measure?.duration || 0;
      } catch (error) {
        console.warn('Performance measure failed:', error);
        return 0;
      }
    }
    return 0;
  },

  /**
   * Get navigation timing
   */
  getNavigationTiming: () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const [timing] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return timing ? {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ssl: timing.connectEnd - timing.secureConnectionStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        load: timing.loadEventEnd - timing.loadEventStart
      } : null;
    }
    return null;
  }
};