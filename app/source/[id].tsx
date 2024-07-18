import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams } from 'expo-router';

const SourceList = () => {
  const { appliedTheme } = useThemeContext();
  const id = useLocalSearchParams();
  console.log(id);
  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <Text>Source with id </Text>
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
