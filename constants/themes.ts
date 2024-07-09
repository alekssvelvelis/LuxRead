// src/constants/themes.ts
import { MD3LightTheme as LightTheme, MD3DarkTheme as DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...LightTheme,
  roundness: 2,
  colors: {
    ...LightTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#ffffff', // Default background color for light theme
    text: '#000000', // Default text color for light theme
    // Define your light theme colors here
  },
};

export const darkTheme = {
  ...DarkTheme,
  roundness: 2,
  colors: {
    ...DarkTheme.colors,
    primary: '#bb86fc',
    accent: '#03dac4',
    background: '#484848', // Default background color for dark theme
    text: '#ffffff', // Default text color for dark theme
  },
};

export const subThemes = {
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