import React, { useEffect, useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getUserTheme, saveUserTheme } from '@/utils/asyncStorage';
import ThemeSelector from '@/components/ThemeSelector';

const useSubThemeColor = (theme: string, subTheme: string, colorName: string) => {
  const [primaryTheme, subThemeName] = theme.split('-');
  return Colors[primaryTheme][subThemeName][colorName];
};

export default function Index() {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<string>(`${systemTheme}-default`);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getUserTheme();
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const primaryTextColor = useSubThemeColor(theme, 'default', 'text');
  const primaryBackgroundColor = useSubThemeColor(theme, 'default', 'background');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: primaryBackgroundColor }}>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text style={{ color: primaryTextColor }}>This is a primary themed text</Text>
      <Text>The primary text color is: {primaryTextColor}</Text>
      <Text>The primary background color is: {primaryBackgroundColor}</Text>
      <ThemeSelector onThemeChange={setTheme} />
    </View>
  );
}
