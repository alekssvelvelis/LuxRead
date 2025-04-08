import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'userTheme';
const READER_OPTIONS_KEY = 'readerOptions';
const NOVEL_ROWS = 'novelRows';
const PURE_BLACK_MODE = 'pure-black';

export const saveItem = async (key: string, value: any) => {
  try {
    // console.log('b4 json stringify in saveItem', value, typeof value);
    let saveValue = typeof value === 'string' ? value : JSON.stringify(value);
    // let saveValue = '';
    // if(typeof value === 'string') {
    //   console.log('saveItem value is string');
    //   saveValue =  value;
    // }else if (typeof value === 'boolean'){
    //   console.log('saveItem value is boolean');
    //   saveValue = JSON.stringify(value);
    // }else{
    //   console.log('saveItem is neither boolean nor string');
    // }
    await AsyncStorage.setItem(key, saveValue)
    // const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    // console.log('after stringify in saveItem', stringValue, typeof stringValue);
    // await AsyncStorage.setItem(key, stringValue);
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

export const saveUserTheme = async (theme: string) => saveItem(THEME_KEY, theme);
export const getUserTheme = async (): Promise<string | null> => getItem(THEME_KEY);

export const saveReaderOptions = async (options: object) => saveItem(READER_OPTIONS_KEY, JSON.stringify(options));
export const getReaderOptions = async (): Promise<string | null> => getItem(READER_OPTIONS_KEY);

export const saveNovelRows = async(number: string) => saveItem(NOVEL_ROWS, number);
export const getNovelRows = async(): Promise<string | null> => getItem(NOVEL_ROWS);

export const savePureBlackMode = async (enabled: boolean) => {
  await saveItem(PURE_BLACK_MODE, enabled);
};

export const getPureBlackMode = async (): Promise<boolean> =>  getItem(PURE_BLACK_MODE, true);

export const getIsDarkMode = async (): Promise<boolean> => getItem('isDarkMode', true);

export const saveIsDarkMode = async (enabled: boolean) =>  saveItem('isDarkMode', enabled);

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage', error);
  }
};
