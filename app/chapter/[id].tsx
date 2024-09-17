import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemeContext';
import { fetchChapterContent } from '@/sources/allnovelfull';
import { Ionicons } from '@expo/vector-icons';
const ChapterPage = () => {
  const [content, setContent] = useState({ title: '', content: [] }); // Ensure content is an object with content as an array
  const [loading, setLoading] = useState(false);
  const { theme, appliedTheme } = useThemeContext();
  const propData = useLocalSearchParams();

  const loadChapterContent = useCallback(async () => {
    setLoading(true);

    try {
      const chapterContent = await fetchChapterContent(propData.chapterPageURL);
      if (chapterContent) {
        setContent(chapterContent);
      }
    } catch (error) {
      console.error('Error fetching chapter content', error);
    } finally {
      setLoading(false);
    }
  }, [propData.chapterPageURL]);

  useEffect(() => {
    loadChapterContent();
  }, [loadChapterContent]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: appliedTheme.colors.background }}>
        <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
      </View>
    );
  }

  const rgbToRgba = (rgb, alpha) => {
    // Extract the RGB values from the string
    const rgbValues = rgb.match(/\d+/g);
    if (rgbValues && rgbValues.length === 3) {
      const [r, g, b] = rgbValues;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return rgb; // Return original if not matched
  };

  const overlayBase = appliedTheme.colors.elevation.level2;
  const overlayBackgroundColor = rgbToRgba(overlayBase, 0.9);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: overlayBackgroundColor, flexDirection: 'row', }]}>
          <Ionicons name={'arrow-back'} size={32} color={appliedTheme.colors.text} />
          <Text style={{color: appliedTheme.colors.text, fontSize: 20, marginBottom: 4, marginLeft: 12}} numberOfLines={1}>{content.title}</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.background }]}
      >
        <Stack.Screen
          options={{
            headerTitle: content.title || 'Loading...',
            headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
            headerTintColor: appliedTheme.colors.text,
            headerShown: false,
          }}
        />
        <View style={[styles.contentContainer]}>
          {content.content.map((paragraph, index) => (
            <Text key={index} style={[styles.chapterText, { color: appliedTheme.colors.text }]}>
              {paragraph}
            </Text>
          ))}
        </View>
        <View style={{width: '100%', alignItems: 'center'}}>
            <Text style={[styles.readingButtonText, {color: appliedTheme.colors.text, marginVertical: 4}]}>Finished {content.title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.readingButton, { backgroundColor: appliedTheme.colors.primary, justifyContent: 'center', alignItems: 'center', marginVertical: 6, }]}
          onPress={() => Alert.alert('Next Chapter Pressed!')}
        >
          <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text }]} numberOfLines={1} ellipsizeMode='tail'>
            Next Chapter
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: overlayBackgroundColor }]}>
        <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between',}}>
          <Ionicons name={'chevron-back'} size={32} color={appliedTheme.colors.text} />
          <Ionicons name={'cog'} size={32} color={appliedTheme.colors.text} />
          <Ionicons name={'chevron-forward'} size={32} color={appliedTheme.colors.text} />
        </View>
      </View>
    </View>
  );
};

export default ChapterPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 0,
  },
  contentContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20, // Add padding bottom to avoid overlap with footer
  },
  chapterText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60, // Set the desired height for your header
    zIndex: 1, // Ensure it is above other content
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50, // Set the desired height for your footer
    zIndex: 1, // Ensure it is above other content
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingButton: {
    marginHorizontal: 16,
    minHeight: 52,
    borderRadius: 50,
    width: '90%',
    overflow: 'hidden',
  },
  readingButtonText: {
    fontSize: 16,
  },
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
});
