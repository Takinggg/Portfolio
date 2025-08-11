/**
 * Enhanced Theme Context and Hook
 * Dark/Light mode implementation with smooth transitions and system preference detection
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to light
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('portfolio-theme') as Theme) || 'light';
    }
    return 'light';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent FOUC by applying theme before paint
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove no-transition class after initialization
    if (isInitialized) {
      root.classList.remove('no-transition');
    } else {
      root.classList.add('no-transition');
    }
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    // Apply theme
    root.classList.add(effectiveTheme);
    setActualTheme(effectiveTheme);

    // Save to localStorage
    localStorage.setItem('portfolio-theme', theme);
    
    // Remove no-transition class after a brief delay to enable smooth transitions
    if (!isInitialized) {
      setTimeout(() => {
        root.classList.remove('no-transition');
        setIsInitialized(true);
      }, 100);
    }
  }, [theme, isInitialized]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setActualTheme(newTheme);
        
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

export default ThemeProvider;