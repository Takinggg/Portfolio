/**
 * App Providers Wrapper
 * Combines all context providers for the application
 */

import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from './context/I18nProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <I18nProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#374151',
              color: '#F9FAFB',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              maxWidth: '400px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F9FAFB',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F9FAFB',
              },
            },
          }}
        />
      </I18nProvider>
    </HelmetProvider>
  );
};

export default AppProviders;