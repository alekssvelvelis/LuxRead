import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'userTheme';
// const NUMBER_KEY = 3;
const READER_OPTIONS_KEY = 'readerOptions';

export const saveUserTheme = async (theme: string) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
    // console.log('Theme saved successfully1');
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

export const storeNovelRows = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value.toString());
    // console.log('Novel row preference stored successfully');
  } catch (e) {
    console.error('Failed to store the number (utils/asyncStorage.ts)', e);
  }
};

export const getNovelRows = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // const string = parseFloat(value);
      // console.log('Retrieved number:', value);
      return value;
    }
  } catch (e) {
    console.error('Failed to retrieve the number', e);
  }
  return null;
};

export const saveReaderOptions = async (options: object) => {
  try {
    await AsyncStorage.setItem(READER_OPTIONS_KEY, JSON.stringify(options));
  } catch (error) {
    console.error('Error saving reader options', error);
  }
};

export const getReaderOptions = async (READER_KEY: string): Promise<string | null> => {
  try {
    const readerOptions = await AsyncStorage.getItem(READER_KEY);
    return readerOptions;
  } catch (error) {
    console.error('Error retrieving reader options', error);
    return null;
  }
};
