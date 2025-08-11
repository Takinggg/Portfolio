import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './AppProviders';
import App from './App.tsx';
import { initSecurity } from './lib/security';
import './index.css';
import './styles/theme.css';

// Initialize security measures
initSecurity();

// Remove no-transition class after initial render to prevent FOUC
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.documentElement.classList.remove('no-transition');
  }, 100);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
