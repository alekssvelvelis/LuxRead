import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, subThemes } from '@/constants/themes';
import { getUserTheme, saveUserTheme } from '@/utils/asyncStorage';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  appliedTheme: any;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<string>(`${systemTheme}-default`);
  
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getUserTheme();
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    saveUserTheme(theme);
  }, [theme]);

  const [primaryTheme, subThemeName] = theme.split('-') as ['light' | 'dark', 'ruby' | 'aquamarine' | 'citrine'];
  const baseTheme = primaryTheme === 'light' ? lightTheme : darkTheme;

  const appliedTheme = {
    ...baseTheme,
    ...subThemes[subThemeName],
    colors: {
      ...baseTheme.colors,
      ...(subThemes[subThemeName]?.colors ?? {}),
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, appliedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
