import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'userTheme';
const READER_OPTIONS_KEY = 'readerOptions';
const NOVEL_ROWS = 'novelRows';
const PURE_BLACK_MODE = 'isDarkMode';
const USER_REMINDER = 'userReminder';
const NOVEL_LAYOUT = 'novelLayout';

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage', error);
  }
};

export const saveItem = async (key: string, value: any) => {
  try {
    let saveValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, saveValue)
  } catch (error) {
    console.error(`Error saving ${key}`, error);
  }
};

export const getItem: {
  (key: string): Promise<string | null>;
  (key: string, bool: true): Promise<boolean>;
} = async (key: string, bool?: boolean): Promise<any> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (bool) {
      return value !== null ? JSON.parse(value) : false;
    }
    return value;
  } catch (error) {
    console.error(`Error retrieving ${key}`, error);
    return bool ? false : null;
  }
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}`, error);
  }
};

export const saveUserTheme = async (theme: string) => saveItem(THEME_KEY, theme);
export const getUserTheme = async (): Promise<string | null> => getItem(THEME_KEY);

export const saveReaderOptions = async (options: object) => saveItem(READER_OPTIONS_KEY, JSON.stringify(options));
export const getReaderOptions = async (): Promise<string | null> => getItem(READER_OPTIONS_KEY);

export const saveNovelRows = async(number: string) => saveItem(NOVEL_ROWS, number);
export const getNovelRows = async(): Promise<string | null> => getItem(NOVEL_ROWS);

export const saveNovelLayout = async (layout: string) => saveItem(NOVEL_LAYOUT, layout);
export const getNovelLayout = async (): Promise<string | null> => getItem(NOVEL_LAYOUT);

export const saveIsDarkMode = async (enabled: boolean) =>  saveItem(PURE_BLACK_MODE, enabled);
export const getIsDarkMode = async (): Promise<boolean> => getItem(PURE_BLACK_MODE, true);

export const saveUserReminder = async (reminder: object) => saveItem(USER_REMINDER, JSON.stringify(reminder));
export const getUserReminder = async (): Promise<string | null> => getItem(USER_REMINDER);

