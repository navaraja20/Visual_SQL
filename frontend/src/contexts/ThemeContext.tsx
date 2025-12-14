import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { themes, getTheme, applyTheme } from '@/utils/themes';

interface ThemeContextType {
  themeId: string;
  setThemeId: (id: string) => void;
  toggleTheme: () => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>('light');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem('selectedTheme');
    if (stored) {
      const theme = getTheme(stored);
      if (theme) {
        setThemeIdState(stored);
        applyTheme(theme);
        // Also set dark class for compatibility
        document.documentElement.classList.toggle('dark', stored === 'dark');
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setThemeIdState(defaultTheme);
      const theme = getTheme(defaultTheme);
      if (theme) {
        applyTheme(theme);
      }
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    const theme = getTheme(id);
    if (theme) {
      applyTheme(theme);
      localStorage.setItem('selectedTheme', id);
      // Set dark class for compatibility
      document.documentElement.classList.toggle('dark', id === 'dark' || id.includes('dark'));
    }
  };

  const toggleTheme = () => {
    // Simple toggle between light and dark (legacy support)
    const newTheme = themeId === 'light' ? 'dark' : 'light';
    setThemeId(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, toggleTheme, showThemeSelector, setShowThemeSelector }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
