import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from './AppContext';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
    border: string;
    shadow: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#F7F8F6',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F1DE',
    text: '#3D405B',
    textSecondary: 'rgba(61, 64, 91, 0.7)',
    textMuted: 'rgba(61, 64, 91, 0.4)',
    primary: '#81B29A',
    secondary: '#E07A5F',
    accent: '#6366F1',
    error: '#E07A5F',
    success: '#81B29A',
    warning: '#F97316',
    border: 'rgba(61, 64, 91, 0.1)',
    shadow: '#3D405B',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#1A1B1E',
    surface: '#2D2E32',
    surfaceSecondary: '#232428',
    text: '#F4F1DE',
    textSecondary: 'rgba(244, 241, 222, 0.7)',
    textMuted: 'rgba(244, 241, 222, 0.4)',
    primary: '#81B29A',
    secondary: '#E07A5F',
    accent: '#818CF8',
    error: '#F87171',
    success: '#81B29A',
    warning: '#FB923C',
    border: 'rgba(244, 241, 222, 0.1)',
    shadow: '#000000',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userSettings, updateUserSettings } = useApp();
  const systemColorScheme = useColorScheme();
  
  const getTheme = (): Theme => {
    if (userSettings.theme === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return userSettings.theme === 'dark' ? darkTheme : lightTheme;
  };

  const [theme, setTheme] = useState<Theme>(getTheme());

  useEffect(() => {
    setTheme(getTheme());
  }, [userSettings.theme, systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme.isDark ? 'light' : 'dark';
    await updateUserSettings({ theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };