import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './AppProviders';
import App from './App.tsx';
import { initSecurity } from './lib/security';
import { performanceMonitor } from './lib/performance';
import './index.css';
import './styles/theme.css';

// Initialize security measures
initSecurity();

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Start performance monitoring in production
  console.log('🚀 Performance monitoring initialized');
}

// Remove no-transition class after initial render to prevent FOUC
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.documentElement.classList.remove('no-transition');
  }, 100);
});

// Cleanup performance monitoring on page unload
window.addEventListener('beforeunload', () => {
  performanceMonitor.cleanup();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
