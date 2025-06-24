import React, { useEffect } from 'react';
import { useUIStore } from '../stores/useUIStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { darkMode, theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Determine if dark mode should be active
    let isDark = false;
    
    if (theme === 'auto') {
      // Check system preference
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = theme === 'dark' || darkMode;
    }

    // Apply dark mode classes
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'auto') {
        if (e.matches) {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
        } else {
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [darkMode, theme]);

  return <>{children}</>;
}; 