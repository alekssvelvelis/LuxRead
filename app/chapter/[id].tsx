import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar } from 'react-native';

import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { upsertNovelChapter } from '@/database/ExpoDB';
import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/contexts/ThemeContext';
import { useNetwork } from '@/contexts/NetworkContext';
import getSourceFunctions from '@/utils/getSourceFunctions';
import { getReaderOptions } from '@/utils/asyncStorage';
import { rgbToRgba } from '@/utils/rgbToRgba';

import { PullUpModal } from '@/components/PullUpModal';
import ReaderSetting from '@/components/settings/ReaderSetting';
import ChapterSkeleton from '@/components/skeletons/ChapterSkeleton';
import { useSpeech } from '@/hooks/useSpeech';

import { getDownloadedChapterContent } from '@/database/ExpoDB';

interface Content {
  title: string;
  content: string[];
  closeChapters: {
    prevChapter?: string | undefined;
    nextChapter?: string | undefined;
  };
}

interface ReaderOptions {
  fontSize: number,
  lineHeight: number,
  textAlign: string,
  fontFamily: string
}

type typeSearchParams = {
  id?: string | number,
  chapterPageURL: string,
  sourceName: string,
  title: string,
  readerProgress?: number,
};

const ChapterPage = () => {
  const [content, setContent] = useState<Content>({ title: '', content: [], closeChapters: {} });
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [readerModalVisible, setReaderModalVisible] = useState<boolean>(false);

  const { isConnected } = useNetwork();
  const { theme, appliedTheme } = useThemeContext();
  const propData = useLocalSearchParams<typeSearchParams>();
  const chapterPageURL: string | string[] = propData.chapterPageURL;
  const sourceName: string | string[] = propData.sourceName;
  const title: string | string[] = propData.title;
  const readerProgress: number = propData.readerProgress ?? 0;
  const router = useRouter();

  const [chapterText, setChapterText] = useState<string>('');
  const { isSpeaking, handleSpeaking } = useSpeech(chapterText);

  const [readerOptions, setReaderOptions] = useState<ReaderOptions>({
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'left',
    fontFamily: 'Roboto'
  });

  useEffect(() => {
    const loadReaderOptions = async () => {
      try {
        const options = await getReaderOptions();
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
      if (!isConnected) {
        try {
          const offlineContent = await getDownloadedChapterContent(chapterPageURL);
          // console.log(JSON.stringify(offlineContent,null,2), 'test');
          if (offlineContent) {
            const contentString = Array.isArray(offlineContent.content) ? offlineContent.content.join(' ') : offlineContent.content;
            setContent({
              title: offlineContent.title,
              content: JSON.parse(contentString),
              closeChapters: {
                prevChapter: offlineContent.closeChapters.prevChapter,
                nextChapter: offlineContent.closeChapters.nextChapter,
              },
            });
            setChapterTitle(offlineContent.title);
            setChapterText(JSON.parse(contentString));
          }
        } catch (error) {
          console.error('Error getting downloaded chapters inside of [id].tsx', error);
        } finally {
          setLoading(false);
        }
      }
    
      if (isConnected) {
        try {
          const chapterContent = await fetchFunctions.fetchChapterContent(chapterPageURL);
          if (chapterContent && chapterContent.title && chapterContent.content) {
            setContent({
              title: chapterContent.title,
              content: chapterContent.content,
              closeChapters: {
                prevChapter: chapterContent.closeChapters.prevChapter,
                nextChapter: chapterContent.closeChapters.nextChapter,
              },
            });
            setChapterText(chapterContent.content);
            setChapterTitle(chapterContent.title);
          } else {
            console.error('Chapter content fetched online is invalid or empty.');
          }
        } catch (error) {
          console.error('Error fetching chapter content', error, chapterPageURL, sourceName);
        } finally {
          setLoading(false);
        }
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
    StatusBar.setBackgroundColor(isOverlayVisible ? appliedTheme.colors.elevation.level2 : appliedTheme.colors.elevation.level3, true);
  };

  const handleReaderOptionsOpen = () => {
    setReaderModalVisible(!readerModalVisible);
  };

  const handleNavigateCloseChapter = async (chapterPageURL: string | undefined) => {
    try {
      router.push({ 
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        pathname: `chapter/[id]`,
        params: {
          chapterPageURL: chapterPageURL,
          title: propData.title,
          sourceName: sourceName,
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };
  const overlayBackgroundColor = rgbToRgba(appliedTheme.colors.elevation.level3, 0.9);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const handleScroll = (event: any) => {
    const newContentHeight = event.nativeEvent.contentSize.height;
    const newScrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const newScrollPercentage = parseFloat(((scrollPosition / (newContentHeight - newScrollViewHeight)) * 100).toFixed(1));
    setScrollPercentage(Math.min(Math.max(newScrollPercentage, 0), 100));
  };

  const handleContentSizeChange = (_: number, height: number) => {
    setContentHeight(height);
  };

  const onLayoutHandler = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  const scrollToPosition = () => {
    if (scrollViewRef.current && contentHeight && scrollViewHeight) {
      const scrollPosition = ((contentHeight - scrollViewHeight) / 100) * readerProgress;
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  };

  useEffect(() => {
    if (contentHeight && scrollViewHeight) {
      scrollToPosition();
    }
  }, [contentHeight, scrollViewHeight]);

  // ((contentHeight-scrollViewHeight)/100)*readerProgress) is used to calculate where it should autoscroll when opening a chapter
  const chapterNumber = chapterTitle.match(/\d+/)?.[0];
  const chapterIndex = chapterNumber ? parseInt(chapterNumber, 10) : 1;
  const handleSaveChapterData = async (novelTitle: string, scrollPercentage: number, chapterIndex: number) => {
    if(propData.id === "[id]"){
      handleBackPress();
      return;
    }
    try {
      await upsertNovelChapter(novelTitle, scrollPercentage, chapterIndex);
      handleBackPress();
    } catch (error) {
      console.error('Error saving chapter:', error);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: appliedTheme.colors.elevation.level2 }}>
        <ChapterSkeleton></ChapterSkeleton>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      {isOverlayVisible && (
        <View style={[styles.header, { backgroundColor: overlayBackgroundColor, flexDirection: 'row' }]}>
          <View style={{flex: 1, flexDirection: 'row', marginBottom: 6}}>
            <Ionicons name={'arrow-back'} size={32} color={appliedTheme.colors.text} style={{ marginLeft: '2%' }} onPress={() => handleSaveChapterData(title, scrollPercentage, chapterIndex)} />
            <Text style={{ color: appliedTheme.colors.text, fontSize: 20, marginBottom: 4, marginLeft: 12, maxWidth: '75%' }} numberOfLines={1}>{content.title}</Text>
            {isSpeaking ? <Ionicons name={'pause-circle-outline'} size={32} color={appliedTheme.colors.text} style={{ marginLeft: '3%', position: 'absolute', right: 8 }} onPress={() => handleSpeaking()}/> : <Ionicons name={'play-circle-outline'} size={32} color={appliedTheme.colors.text} style={{ marginLeft: '3%', position: 'absolute', right: 8 }} onPress={() => handleSpeaking()}/>}
          </View>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2 }]}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}  // Captures content height after it renders
        onLayout={onLayoutHandler} 
        scrollEventThrottle={16}
      >
        <Pressable onPress={toggleOverlay}>
          <Stack.Screen
            options={{
              headerTitle: `${chapterTitle}`,
              headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
              headerTintColor: appliedTheme.colors.text,
              headerShown: false,
            }}
          />
          <View style={styles.contentContainer}>
            {content.content.length > 0 ? (
              content.content.map((paragraph, index) => (
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
              ))
            ) : (
              <Text style={{ color: appliedTheme.colors.text }}>No content available.</Text>
            )}
          </View>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text, marginVertical: 4, marginTop: 12, width: '100%', textAlign: 'center' }]}>
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
                <Ionicons name={'arrow-back'} size={32} color={content.closeChapters['prevChapter'] ? appliedTheme.colors.text : appliedTheme.colors.secondary} onPress={content.closeChapters['prevChapter'] ? () => handleNavigateCloseChapter(content.closeChapters['prevChapter']) : undefined}/> 
            </View>
            <View style={{width: '33%', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name={'cog'} size={32} color={appliedTheme.colors.text} onPress={handleReaderOptionsOpen} />
            </View>
            <View style={{width: '33%', justifyContent:'center', alignItems:'center'}}>
                <View>
                  <Ionicons name={'arrow-forward'} size={32} color={content.closeChapters['nextChapter'] ? appliedTheme.colors.text : appliedTheme.colors.secondary} onPress={content.closeChapters['nextChapter'] ?() => handleNavigateCloseChapter(content.closeChapters['nextChapter']) : undefined}/>
                </View>
            </View>
          </View>
        </View>
      )}

      {readerModalVisible && (
        <PullUpModal visible={readerModalVisible} onClose={handleReaderOptionsOpen}>
          <Text style={{ color: appliedTheme.colors.primary, fontSize: 24 }}>Reader options</Text>
          <ReaderSetting onOptionsChange={handleOptionsChange}/>
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
    height: 50,
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
