import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack } from 'expo-router';

const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const novel = useLocalSearchParams();
  const imageUrl = typeof novel.imageUrl === 'string' ? novel.imageUrl : '';
  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <Stack.Screen 
      options={{
        headerTitle: `${novel.title}`,
        headerStyle:  {backgroundColor: appliedTheme.colors.elevation.level2},
        headerTintColor: appliedTheme.colors.text,
      }}/>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={[styles.title, { color: appliedTheme.colors.text }]}>{novel.title}</Text>
      <Text style={[styles.chapters, { color: appliedTheme.colors.text }]}>Chapters: {novel.chapters}</Text>
    </View>
  );
};
export default Synopsis;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chapters: {
    fontSize: 16,
  },
});
