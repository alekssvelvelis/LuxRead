import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, pureBlackTheme, subThemes } from '@/constants/themes';
import { getUserTheme, saveUserTheme, getIsDarkMode, saveIsDarkMode } from '@/utils/asyncStorage';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  appliedTheme: any;
  isPureBlack: boolean | null;
  setPureBlack: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<string>(`${systemTheme}-default`);
  const [isPureBlack, setPureBlack] = useState<boolean | null>(null);
  
  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await getUserTheme();
      const savedPureBlack = await getIsDarkMode();
      if(savedTheme) setTheme(savedTheme);
      if(savedPureBlack) setPureBlack(savedPureBlack);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    saveUserTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (isPureBlack !== null && isPureBlack !== undefined) {
      saveIsDarkMode(isPureBlack);
    }
  }, [isPureBlack]);

  const [primaryTheme, subThemeName] = theme.split('-') as ['light' | 'dark', 'ruby' | 'aquamarine' | 'citrine'];
  
  let baseTheme = primaryTheme === 'light' ? lightTheme : darkTheme;
  if (primaryTheme === 'dark' && isPureBlack) {
    baseTheme = pureBlackTheme;
  }

  const appliedTheme = {
    ...baseTheme,
    ...subThemes[subThemeName],
    colors: {
      ...baseTheme.colors,
      ...(subThemes[subThemeName]?.colors ?? {}),
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, appliedTheme, isPureBlack, setPureBlack }}>
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
