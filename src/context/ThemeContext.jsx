import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEME_MODE_STORAGE_KEY = 'rideflow_theme_mode';
const THEME_PALETTE_STORAGE_KEY = 'rideflow_active_theme';

// Named 6-Color Tamil Nadu Transit Palette
export const TN_PALETTE = {
  rickshawOchre: '#C9501F',
  marinaTeal: '#0B5D52',
  asphaltBlack: '#1E1B16',
  sandPaper: '#F6EFE2',
  templeGold: '#D9A441',
  kolamRed: '#B23A2E'
};

export const THEMES = [
  {
    id: 'tn-heritage',
    name: 'Tamil Nadu Heritage (Signature)',
    tagline: 'Rickshaw Ochre & Marina Coastline',
    colors: ['#C9501F', '#0B5D52', '#F6EFE2', '#1E1B16'],
    accentHex: '#C9501F',
    secondaryHex: '#0B5D52',
    bgHex: '#F6EFE2',
    textHex: '#1E1B16',
    description: 'Auto-rickshaw ochre, Marina teal, warm asphalt, and sand paper background.'
  },
  {
    id: 'marina-coast',
    name: 'Marina Coastal Breeze',
    tagline: 'Deep Teal & Temple Gold',
    colors: ['#0B5D52', '#D9A441', '#F6EFE2', '#1E1B16'],
    accentHex: '#0B5D52',
    secondaryHex: '#D9A441',
    bgHex: '#F6EFE2',
    textHex: '#1E1B16',
    description: 'Calm Marina teal with gold accents and warm sand background.'
  },
  {
    id: 'corridor-asphalt',
    name: 'OMR Expressway High-Contrast',
    tagline: 'Sharp Ochre & Night Asphalt',
    colors: ['#C9501F', '#D9A441', '#14120E', '#F6EFE2'],
    accentHex: '#C9501F',
    secondaryHex: '#D9A441',
    bgHex: '#1E1B16',
    textHex: '#F6EFE2',
    description: 'High-contrast arterial road palette tuned for high readability.'
  }
];

export const ThemeProvider = ({ children }) => {
  // Theme mode: 'light' | 'dark'
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (savedMode === 'dark' || savedMode === 'light') {
        return savedMode;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // Fallback
    }
    return 'light';
  });

  // Color palette preset
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_PALETTE_STORAGE_KEY);
      return saved && THEMES.some((t) => t.id === saved) ? saved : 'tn-heritage';
    } catch {
      return 'tn-heritage';
    }
  });

  // Apply dark/light class to <html> on mount and change
  useEffect(() => {
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme mode:', e);
    }

    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-mode', 'dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-mode', 'light');
      root.setAttribute('data-theme', 'light');
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_PALETTE_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme palette:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        isDark,
        toggleTheme,
        toggleMode: toggleTheme,
        theme,
        setTheme,
        currentThemeMeta: THEMES.find((t) => t.id === theme) || THEMES[0],
        availableThemes: THEMES,
        themes: THEMES,
        activeTheme: theme,
        palette: TN_PALETTE
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
