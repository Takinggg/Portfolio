/**
 * App Providers Wrapper
 * Combines all context providers for the application
 */

import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './hooks/theme/ThemeProvider';
import { I18nProvider } from './context/I18nProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <I18nProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </I18nProvider>
    </HelmetProvider>
  );
};

export default AppProviders;