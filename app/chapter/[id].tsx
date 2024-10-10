import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';

import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { upsertNovelChapter } from '@/database/ExpoDB';
import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemeContext';

import getSourceFunctions from '@/utils/getSourceFunctions';
import { getReaderOptions } from '@/utils/asyncStorage';

import { PullUpModal } from '@/components/PullUpModal';
import ReaderOptions from '@/components/settings/ReaderOptions';

interface Content {
  title: string;
  content: string[];
  closeChapters: {
    prevChapter?: string;
    nextChapter?: string;
  };
}

const ChapterPage = () => {
  const [content, setContent] = useState<Content>({ title: '', content: [], closeChapters: {} });
  const [loading, setLoading] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [readerModalVisible, setReaderModalVisible] = useState(false);

  const { appliedTheme } = useThemeContext();
  const propData = useLocalSearchParams();
  const chapterPageURL: string | string[] = propData.chapterPageURL;
  const sourceName: string | string[] = propData.sourceName;
  const router = useRouter();

  const [readerOptions, setReaderOptions] = useState({
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'left',
    fontFamily: 'Roboto'
  });

  useEffect(() => {
    const loadReaderOptions = async () => {
      try {
        const options = await getReaderOptions('readerOptions');
        if (options) {
          const { fontSize, lineHeight, textAlign, fontFamily } = JSON.parse(options);
          setReaderOptions({
            fontSize: fontSize || 16,
            lineHeight: lineHeight || 25,
            textAlign: textAlign || 'left',
            fontFamily: fontFamily || 'Roboto',
          });
        }
      } catch (error) {
        console.error('Error loading reader options', error);
      }
    };

    loadReaderOptions();
  }, []);

  const [fetchFunctions, setFetchFunctions] = useState<any>(null);
  useEffect(() => {
    if (sourceName) {
      try {
        const functions = getSourceFunctions(sourceName);
        setFetchFunctions(functions);
      } catch (error) {
        console.error('Error loading source functions:', error);
      }
    }
  }, [sourceName]);

  const handleOptionsChange = (options: { fontSize: number; lineHeight: number; textAlign: string; fontFamily: string }) => {
    setReaderOptions(options);
  };

  useEffect(() => {
    const loadChapterContent = async () => {
      setLoading(true);
      try {
        const chapterContent = await fetchFunctions.fetchChapterContent(chapterPageURL);
        // console.log(JSON.stringify(chapterContent, null, 2));
        if (chapterContent) {
          setContent(chapterContent);
        }
      } catch (error) {
        console.error('Error fetching chapter content', error, chapterPageURL, sourceName);
      } finally {
        setLoading(false);
      }
    };
  
    if (fetchFunctions) {
      loadChapterContent();
    }
  }, [fetchFunctions, chapterPageURL, sourceName]);

  const handleBackPress = () => {
    router.back();
  };

  const toggleOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible);
  };

  const handleReaderOptionsOpen = () => {
    setReaderModalVisible(!readerModalVisible);
  };

  const handleNavigateCloseChapter = async (chapterPageURL: string) => {
    try {
      router.navigate({ 
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
          title: propData.title,
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  const rgbToRgba = (rgb: string, alpha: number) => {
    const rgbValues = rgb.match(/\d+/g);
    if (rgbValues && rgbValues.length === 3) {
      const [r, g, b] = rgbValues;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return rgb;
  };

  const overlayBase = appliedTheme.colors.elevation.level2;
  const overlayBackgroundColor = rgbToRgba(overlayBase, 0.9);

  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollOffset(offsetY);
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    setContentHeight(contentHeight);
  };

  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  const scrollPercentage = contentHeight > 0 ? ((scrollOffset / (contentHeight - scrollViewHeight)) * 100).toFixed(1) : 0;
  // ((contentHeight-scrollViewHeight)/100)*readerProgress) is used to calculate where it should autoscroll when opening a chapter
  const chapterNumber = content.title.match(/\d/);
  const chapterIndex = chapterNumber ? parseInt(chapterNumber[0], 10) : null;
  const handleSaveChapterData = async (novelTitle: string, scrollPercentage: number, chapterIndex: number) => {
    try {
      console.log(novelTitle, scrollPercentage, chapterIndex);
      await upsertNovelChapter(novelTitle, scrollPercentage, chapterIndex);
      handleBackPress();
    } catch (error) {
      console.error('Error saving chapter:', error);
    }
   
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: appliedTheme.colors.background }}>
        <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isOverlayVisible && (
        <View style={[styles.header, { backgroundColor: overlayBackgroundColor, flexDirection: 'row' }]}>
          <Ionicons name={'arrow-back'} size={32} color={appliedTheme.colors.text} style={{ marginLeft: '2%' }} onPress={() => handleSaveChapterData(propData.title, scrollPercentage, chapterIndex)} />
          <Text style={{ color: appliedTheme.colors.text, fontSize: 20, marginBottom: 4, marginLeft: 12 }} numberOfLines={1}>{content.title}</Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.background }]}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Pressable onPress={toggleOverlay}>
          <Stack.Screen
            options={{
              headerTitle: content.title || 'Loading...',
              headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
              headerTintColor: appliedTheme.colors.text,
              headerShown: false,
            }}
          />
          <View style={styles.contentContainer}>
            {content.content.map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.chapterText,
                  {
                    color: appliedTheme.colors.text,
                    fontSize: readerOptions.fontSize,
                    lineHeight: readerOptions.lineHeight,
                    textAlign: readerOptions.textAlign,
                    fontFamily: readerOptions.fontFamily,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text, marginVertical: 4 }]}>
              Finished {content.title}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.readingButton, { backgroundColor: appliedTheme.colors.primary, justifyContent: 'center', alignItems: 'center', marginVertical: 6 }]}
            onPress={() => handleNavigateCloseChapter(content.closeChapters['nextChapter'])}
          >
            <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              Next Chapter
            </Text>
          </TouchableOpacity>
        </Pressable>
      </ScrollView>

      {isOverlayVisible && (
        <View style={[styles.footer, { backgroundColor: overlayBackgroundColor }]}>
          <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-around'}}>
            <View style={{width: '33%', justifyContent:'center', alignItems:'center'}}>
              {content.closeChapters['prevChapter'] &&
                <Ionicons name={'arrow-back'} size={32} color={appliedTheme.colors.text} onPress={() => handleNavigateCloseChapter(content.closeChapters['prevChapter'])}/> 
              }
            </View>
            <View style={{width: '33%', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name={'cog'} size={32} color={appliedTheme.colors.text} onPress={handleReaderOptionsOpen} />
            </View>
            <View style={{width: '33%', justifyContent:'center', alignItems:'center'}}>
              {content.closeChapters['nextChapter'] &&
                <Ionicons name={'arrow-forward'} size={32} color={appliedTheme.colors.text} onPress={() => handleNavigateCloseChapter(content.closeChapters['nextChapter'])}/>
              }
            </View>
          </View>
        </View>
      )}

      {readerModalVisible && (
        <PullUpModal visible={readerModalVisible} onClose={handleReaderOptionsOpen}>
          <Text style={{ color: appliedTheme.colors.primary, fontSize: 24 }}>Reader options</Text>
          <ReaderOptions onOptionsChange={handleOptionsChange}/>
        </PullUpModal>
      )}
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
    paddingTop: 28,
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
    height: 60,
    zIndex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 1,
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
});
