import { createMMKV } from 'react-native-mmkv'

export const mmkv = createMMKV();

const KEYS = {
  THEME_KEY: 'userTheme',
  READER_OPTIONS_KEY: 'readerOptions',
  NOVEL_ROWS: 'novelRows',
  PURE_BLACK_MODE: 'isPureBlackActive',
  USER_REMINDER: 'userReminder',
  NOVEL_LAYOUT: 'novelLayout'
} as const;

export const clearMMKVStorage = () => {
  try {
    mmkv.clearAll();
  } catch (error) {
    console.error('Error clearing storage', error);
  }
};

const saveMMKVItem = (key: string, value: string | number | boolean | object) => {
  try {
    let saveValue = typeof value === 'string' ? value : JSON.stringify(value);
    mmkv.set(key, saveValue);
  } catch (error) {
    console.error(`Error saving MMKV item ${key}`, error);
  }
};

const saveMMKVObject = (key: string, value: object) => {
  try {
    saveMMKVItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving MMKV item ${key}`, error);
  }
}

const getMMKVString = (key: string): string | undefined => {
  try {
    return mmkv.getString(key);
  } catch (error) {
    console.error(`Error getting MMKV string ${key}`, error);
    return undefined;
  }
};

const getMMKVNumber = (key: string): number | undefined => {
  try {
    return mmkv.getNumber(key);
  } catch (error) {
    console.error(`Error getting MMKV number ${key}`, error);
    return undefined;
  }
};

const getMMKVBoolean = (key: string): boolean | undefined => {
  try {
    return mmkv.getBoolean(key);
  } catch (error) {
    console.error(`Error getting MMKV boolean ${key}`, error);
    return undefined;
  }
};

const getMMKVObject = (key: string): object | undefined => {
  const object = getMMKVString(key);
  if(object === undefined) return undefined;
  try {
    return JSON.parse(object);
  } catch (error) {
    console.error(`Error parsing MMKV object ${key}`, error);
    return undefined;
  }
}

export const removeItem = async (key: string) => {
  try {
    mmkv.remove(key);
  } catch (error) {
    console.error(`Error removing ${key}`, error);
  }
};

export const saveUserTheme = async (theme: string) => saveMMKVItem(KEYS.THEME_KEY, theme);
export const getUserTheme = async (): Promise<string | undefined> => getMMKVString(KEYS.THEME_KEY);

export const saveReaderOptions = async (options: object) => saveMMKVItem(KEYS.READER_OPTIONS_KEY, JSON.stringify(options));
export const getReaderOptions = async (): Promise<string | undefined> => getMMKVString(KEYS.READER_OPTIONS_KEY);

export const saveNovelRows = async(number: number) => saveMMKVItem(KEYS.NOVEL_ROWS, number);
export const getNovelRows = async(): Promise<number | undefined> => getMMKVNumber(KEYS.NOVEL_ROWS);

export const saveNovelLayout = async (layout: string) => saveMMKVItem(KEYS.NOVEL_LAYOUT, layout);
export const getNovelLayout = async (): Promise<string | undefined> => getMMKVString(KEYS.NOVEL_LAYOUT);

export const saveIsDarkMode = async (enabled: boolean) =>  saveMMKVItem(KEYS.PURE_BLACK_MODE, enabled);
export const getIsDarkMode = async (): Promise<boolean | undefined> => getMMKVBoolean(KEYS.PURE_BLACK_MODE);

export const saveUserReminder = async (reminder: object) => saveMMKVItem(KEYS.USER_REMINDER, JSON.stringify(reminder));
export const getUserReminder = async (): Promise<object | undefined> => getMMKVObject(KEYS.USER_REMINDER);

