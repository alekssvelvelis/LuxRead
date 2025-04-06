// src/constants/themes.ts
import { MD3LightTheme as LightTheme, MD3DarkTheme as DarkTheme } from 'react-native-paper';


export type Theme = {
  colors: {
    primary: string;
    accent: string;
    background: string;
    onSecondary: string;
    secondary: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    secondaryContainer: string;
    onTertiary: string;
    text: string;
    test: string;
    elevation: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
    // Add other custom colors as needed
  };
};

type SubTheme = {
  colors: {
    primary: string;
    [key: string]: string;
  };
};

export type SubThemesType = {
  default: SubTheme;
  ruby: SubTheme;
  aquamarine: SubTheme;
  citrine: SubTheme;
};

export const lightTheme: Theme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f3f3f3', // Default background color for light theme // Default text color for light theme
    // Define your light theme colors here
    text: '#000000', // Default text color for dark theme
    test: '#68DDDD',
  },
};

export const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#bb86fc',
    accent: '#03dac4',
    background: '#484848', // Default background color for dark theme
    text: '#ffffff', // Default text color for dark theme
    test: '#68DDDD',
  },
};

export const pureBlackTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#000000',
    elevation: {
      level0: '#000000',
      level1: '#000000',
      level2: '#000000',
      level3: '#151515',
      level4: '#151515',
      level5: '#151515',
    }
  },
};

export const subThemes = {
    default: {
      colors: {
          primary: '#bb86fc',
      },
    },
    ruby: {
      colors: {
          primary: '#e63946',
      },
    },
    aquamarine: {
      colors: {
          primary: '#2a9d8f',
      },
    },
    citrine: {
      colors: {
          primary: '#e9c46a',
      },
    },
  };