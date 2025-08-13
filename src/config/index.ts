/**
 * Application Configuration
 * Centralized configuration management with environment variables
 */

// Contact Information - Using environment variables for security
export const CONTACT_INFO = {
  email: import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+33-X-XX-XX-XX-XX',
  location: import.meta.env.VITE_CONTACT_LOCATION || 'France',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  emailServiceUrl: import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001/api/contact',
} as const;



// Application Metadata for SEO
export const APP_METADATA = {
  title: 'Portfolio Professionnel',
  description: 'Portfolio professionnel moderne - Développement web et design',
  author: 'Portfolio Owner',
  keywords: ['portfolio', 'développement web', 'design', 'freelance'],
  url: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  image: '/og-image.jpg',
} as const;

// Performance and Analytics Configuration
export const PERFORMANCE_CONFIG = {
  enableAnalytics: import.meta.env.PROD,
  enablePerformanceMonitoring: import.meta.env.PROD,
  enableErrorTracking: import.meta.env.PROD,
} as const;

// Validation helper to ensure required environment variables are set
export const validateConfig = () => {
  const warnings: string[] = [];

  if (CONTACT_INFO.email === 'contact@example.com') {
    warnings.push('VITE_CONTACT_EMAIL is not configured');
  }

  if (CONTACT_INFO.phone === '+33-X-XX-XX-XX-XX') {
    warnings.push('VITE_CONTACT_PHONE is not configured');
  }



  if (warnings.length > 0 && import.meta.env.PROD) {
    console.error('Configuration warnings:', warnings);
  } else if (warnings.length > 0) {
    console.warn('Configuration warnings:', warnings);
  }

  return warnings;
};

// Initialize configuration validation
validateConfig();