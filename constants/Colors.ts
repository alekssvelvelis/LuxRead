/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    default: {
      text: 'red',
      background: '#fff',
      tint: '#0a7ea4',
    },
    ruby: {
      text: '#333',
      background: '#f7f7f7',
      tint: '#0a7ea4',
    },
    aquamarine: {
      text: '#666',
      background: '#efefef',
      tint: '#0a7ea4',
    },
    citrine: {
      text: '#999',
      background: '#eeffee',
      tint: '#0a7ea4',
    }

  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    default: {
      text: 'red',
      background: '#000',
      tint: '#fff',
    },
    ruby: {
      text: '#ddd',
      background: '#222',
      tint: '#fff',
    },
    aquamarine: {
      text: '#ddd',
      background: '#333',
      tint: '#fff',
    },
    citrine: {
      text: '#ccc',
      background: '#444',
      tint: '#fff',
    },

  },
};
