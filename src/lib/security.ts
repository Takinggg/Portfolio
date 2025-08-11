/**
 * Security utilities for production environment
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - for production, use a library like DOMPurify
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Rate limiting for form submissions
 */
class SimpleRateLimit {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }

  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remaining = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

export const contactFormRateLimit = new SimpleRateLimit(3, 300000); // 3 attempts per 5 minutes

/**
 * Environment variable validation
 */
export const validateEnvVars = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  // Validate API URL format
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl && !isValidUrl(apiUrl)) {
    console.warn('Invalid API URL format:', apiUrl);
  }
};

/**
 * Secure token storage
 */
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // In a real app, consider encrypting sensitive data
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }
};

/**
 * Content Security Policy helpers
 */
export const cspHelpers = {
  getNonce: (): string => {
    // Generate a random nonce for inline scripts/styles
    return btoa(Math.random().toString()).substring(0, 16);
  }
};

/**
 * Error logging utility
 */
export const errorLogger = {
  log: (error: Error, context?: Record<string, unknown>): void => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorData });
      console.error('Production error:', errorData);
    } else {
      console.error('Development error:', errorData);
    }
  }
};

/**
 * Initialize security measures
 */
export const initSecurity = (): void => {
  validateEnvVars();
  
  // Add security headers via meta tags (if not set by server)
  if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
    const frameOptions = document.createElement('meta');
    frameOptions.setAttribute('http-equiv', 'X-Frame-Options');
    frameOptions.setAttribute('content', 'DENY');
    document.head.appendChild(frameOptions);
  }
  
  // Disable drag and drop of images to prevent certain attacks
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());
};