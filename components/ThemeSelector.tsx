import React from 'react';
import { View, Button } from 'react-native';
import { saveUserTheme } from '@/utils/asyncStorage';

const ThemeSelector = ({ onThemeChange }: { onThemeChange: (theme: string) => void }) => {
  const themes = ['light-default', 'light-ruby', 'light-aquamarine', 'light-citrine', 'dark-default', 'dark-ruby', 'dark-aquamarine', 'dark-citrine'];

  return (
    <View>
      {themes.map(theme => (
        <Button
          key={theme}
          title={`Select ${theme}`}
          onPress={() => {
            saveUserTheme(theme);
            onThemeChange(theme);
          }}
        />
      ))}
    </View>
  );
};

export default ThemeSelector;
