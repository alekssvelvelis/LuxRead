import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'userTheme';
const READER_OPTIONS_KEY = 'readerOptions';
const NOVEL_ROWS = 'novelRows';

export const saveItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving ${key}`, error);
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Error retrieving ${key}`, error);
    return null;
  }
};

export const saveUserTheme = async (theme: string) => saveItem(THEME_KEY, theme);
export const getUserTheme = async (): Promise<string | null> => getItem(THEME_KEY);

export const saveReaderOptions = async (options: object) => saveItem(READER_OPTIONS_KEY, JSON.stringify(options));
export const getReaderOptions = async (): Promise<string | null> => getItem(READER_OPTIONS_KEY);

export const saveNovelRows = async(number: string) => saveItem(NOVEL_ROWS, number);
export const getNovelRows = async(): Promise<string | null> => getItem(NOVEL_ROWS);

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage', error);
  }
};
