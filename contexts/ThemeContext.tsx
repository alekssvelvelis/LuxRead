import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, pureBlackTheme, subThemes } from '@/constants/themes';
import { getUserTheme, saveUserTheme, getPureBlackMode, savePureBlackMode } from '@/utils/mmkv';

type SubTheme = keyof typeof subThemes;
type PrimaryTheme = "light" | "dark"
type ThemeName = `${PrimaryTheme}-${SubTheme}`

const isValidTheme = (value: unknown): value is ThemeName => {
  if (typeof value !== 'string') return false;
  const [primary, sub] = value.split('-');
  return (primary === 'light' || primary === 'dark') && sub in subThemes;
}

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
  const [isPureBlack, setPureBlack] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  
  useEffect(() => {
    (async() => {
      try {
        const [savedTheme, savedPureBlack] = await Promise.all([
          getUserTheme(),
          getPureBlackMode(),
        ]);
        if (isValidTheme(savedTheme)) setTheme(savedTheme);
        if (typeof isPureBlack === 'boolean') setPureBlack(savedPureBlack ? savedPureBlack : false);
      } catch (error) {
        console.error('Error fetching user theme ',error)
      } finally {
        setHydrated(true);
      }
    });
  }, [])

  useEffect(() => {
    if (hydrated) saveUserTheme(theme);
  },[theme, hydrated]);

  useEffect(() => {
    if (hydrated) savePureBlackMode(isPureBlack);
  },[isPureBlack, hydrated]);

  const appliedTheme = useMemo(() => {
    const [primary, subName] = theme.split("-") as [PrimaryTheme, SubTheme];
    let base = primary === 'light' ? lightTheme : darkTheme;
    if (primary === 'dark' && isPureBlack) base = pureBlackTheme;
    const sub = subThemes[subName];
    return {  ...base, ...sub, colors: { ...base.colors, ...sub.colors }};
  }, [theme, isPureBlack]);

  const value = useMemo(
    () => ({ theme, setTheme, isPureBlack, setPureBlack, appliedTheme }),
    [theme, appliedTheme, isPureBlack]
  )
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContext');
  }
  return context;
};
