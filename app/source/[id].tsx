import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack } from 'expo-router';

const SourceList = () => {
  const { appliedTheme } = useThemeContext();
  const source = useLocalSearchParams();
  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
        <Stack.Screen 
      options={{
        headerTitle: `${source.sourceName}`,
        headerStyle:  {backgroundColor: appliedTheme.colors.elevation.level2},
        headerTintColor: appliedTheme.colors.text,
      }}/>
      <Text>Source with id {source.id}</Text>
    </View>
  );
};
export default SourceList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
});
