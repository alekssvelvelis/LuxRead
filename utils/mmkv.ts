import { createMMKV } from 'react-native-mmkv';

export const mmkv = createMMKV();

const KEYS = {
  ONBOARDING_DONE: 'onboardingDone',
  THEME_KEY: 'userTheme',
  READER_OPTIONS_KEY: 'readerOptions',
  NOVEL_ROWS: 'novelRows',
  PURE_BLACK_MODE: 'isPureBlackActive',
  USER_REMINDER: 'userReminder',
  NOVEL_LAYOUT: 'novelLayout',
} as const;

const safe = <T>(label: string, fn: () => T): T | undefined => {
  try {
    return fn();
  } catch (error) {
    console.error(label, error);
    return undefined;
  }
};

const setPrimitive = (key: string, value: string | number | boolean) =>
  safe(`Error saving MMKV item ${key}`, () => mmkv.set(key, value));

const setObject = (key: string, value: object) =>
  safe(`Error saving MMKV object ${key}`, () =>
    mmkv.set(key, JSON.stringify(value))
  );

const getString = (key: string) => safe(`Error getting MMKV string ${key}`, () => mmkv.getString(key));

const getNumber = (key: string) => safe(`Error getting MMKV number ${key}`, () => mmkv.getNumber(key));

const getBoolean = (key: string) => safe(`Error getting MMKV boolean ${key}`, () => mmkv.getBoolean(key));

const getObject = <T extends object = object>(key: string): T | undefined => {
  const raw = getString(key);
  if (raw === undefined) return undefined;
  return safe(`Error parsing MMKV object ${key}`, () => JSON.parse(raw) as T);
};

export const clearMMKVStorage = () => safe('Error clearing storage', () => mmkv.clearAll());

export const removeItem = (key: string) => safe(`Error removing ${key}`, () => mmkv.remove(key));

export const saveOnboardingDone = (onboarding: number) => setPrimitive(KEYS.ONBOARDING_DONE, onboarding);
export const getOnboardingDone = (): number | undefined => getNumber(KEYS.ONBOARDING_DONE);

export const saveUserTheme = (theme: string) => setPrimitive(KEYS.THEME_KEY, theme);
export const getUserTheme = (): string | undefined => getString(KEYS.THEME_KEY);

export const saveReaderOptions = (options: object) => setObject(KEYS.READER_OPTIONS_KEY, options);
export const getReaderOptions = <T extends object = object>(): T | undefined => getObject<T>(KEYS.READER_OPTIONS_KEY);

export const saveNovelRows = (rows: number) => setPrimitive(KEYS.NOVEL_ROWS, rows);
export const getNovelRows = (): number | undefined => getNumber(KEYS.NOVEL_ROWS);

export const saveNovelLayout = (layout: string) =>
  setPrimitive(KEYS.NOVEL_LAYOUT, layout);
export const getNovelLayout = (): string | undefined => getString(KEYS.NOVEL_LAYOUT);

export const savePureBlackMode = (enabled: boolean) => setPrimitive(KEYS.PURE_BLACK_MODE, enabled);
export const getPureBlackMode = (): boolean | undefined => getBoolean(KEYS.PURE_BLACK_MODE);

export const saveUserReminder = (reminder: object) => setObject(KEYS.USER_REMINDER, reminder);
export const getUserReminder = <T extends object = object>(): T | undefined => getObject<T>(KEYS.USER_REMINDER);