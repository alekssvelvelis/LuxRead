import React from 'react';
import { View, Button, Text } from 'react-native';

const ThemeSelector = ({ onThemeChange }: { onThemeChange: (theme: string) => void }) => {
  const themes = ['light-default', 'light-ruby', 'light-aquamarine', 'light-citrine', 'dark-default', 'dark-ruby', 'dark-aquamarine', 'dark-citrine'];

  return (
    <View>
      {themes.map(theme => (
        <View key={theme}>
          <Text>{theme}</Text>
          <Button
            title={`Select ${theme}`}
            onPress={() => onThemeChange(theme)}
          />
        </View>
      ))}
    </View>
  );
};

export default ThemeSelector;
