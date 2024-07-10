import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/settings/ThemeSelector';

export default function Settings() {
  const { theme, setTheme, appliedTheme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <Text style={{ color: appliedTheme.colors.text }}>Settings Screen</Text>
      <ThemeSelector onThemeChange={setTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
