import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getUserTheme, saveUserTheme } from '@/utils/asyncStorage';
import ThemeSelector from '@/components/ThemeSelector';
import { useSubThemeColor } from '@/hooks/useThemeColor';

export default function Index() {
  const [theme, setTheme] = useState<string>('dark-default'); // Default to dark-default

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getUserTheme();
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const [primaryTheme, subThemeName] = theme.split('-') as ['light' | 'dark', 'default' | 'ruby' | 'aquamarine' | 'citrine'];
  const primaryTextColor = useSubThemeColor(primaryTheme, subThemeName, 'text');
  const primaryBackgroundColor = useSubThemeColor(primaryTheme, subThemeName, 'background');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: primaryBackgroundColor }}>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text style={{ color: primaryTextColor }}>This is a primary themed text</Text>
      <Text>The primary theme name is: {primaryTheme}</Text>
      <Text>The subtheme nameis: {subThemeName}</Text>
      <ThemeSelector onThemeChange={setTheme} />
    </View>
  );
}
