/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

/**
 * This function returns a theme color based on the current color scheme (light or dark mode).
 * It allows for color overrides via props.
 * @param props - An object containing light and dark mode color overrides.
 * @param colorName - The name of the color in the Colors object.
 * @returns The color value based on the current theme or the override if provided.
 */

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

/**
 * This function returns a color from a specific sub-theme based on the current color scheme (light or dark mode).
 * It does not allow for color overrides via props and directly accesses the Colors object.
 * @param subTheme - The sub-theme to retrieve the color from (e.g., 'primary', 'secondary', 'tertiary').
 * @param colorName - The name of the color in the sub-theme.
 * @returns The color value based on the current theme and sub-theme.
 */

export function useSubThemeColor(
  subTheme: 'default' | 'ruby' | 'aquamarine' | 'citrine',
  colorName: keyof typeof Colors.light.default
): string {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme][subTheme][colorName];
}
