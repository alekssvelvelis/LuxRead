import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'userTheme';

export const saveUserTheme = async (theme: string) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
    console.log('Theme saved successfully');
  } catch (error) {
    console.error('Error saving theme', error);
  }
};

export const getUserTheme = async (): Promise<string | null> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return theme;
  } catch (error) {
    console.error('Error retrieving theme', error);
    return null;
  }
};
