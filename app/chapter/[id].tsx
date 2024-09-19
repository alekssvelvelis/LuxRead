import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Pressable, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemeContext';
import { fetchChapterContent } from '@/sources/allnovelfull';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PullUpModal } from '@/components/PullUpModal';
import Slider from '@react-native-community/slider';

interface Content {
  title: string;
  content: string[];
  closeChapters: {
    prevChapter?: string;
    nextChapter?: string;
    // add other chapters if there are any
  };
}

const ChapterPage = () => {
  const [content, setContent] = useState<Content>({ title: '', content: [], closeChapters: {} });
  const [loading, setLoading] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [readerOptions, setReaderOptions] = useState(false);

  const { appliedTheme } = useThemeContext();
  const propData = useLocalSearchParams();
  let chapterPageURL: string = propData.chapterPageURL;
  const router = useRouter();

  // State for text settings
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(25);
  const [textAlign, setTextAlign] = useState('left');
  const [fontFamily, setFontFamily] = useState('Roboto');

  const loadChapterContent = useCallback(async () => {
    setLoading(true);

    try {
      const chapterContent = await fetchChapterContent(chapterPageURL);
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

  const handleBackPress = () => {
    router.back();
  };

  const toggleOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible);
  };

  const handleReaderOptionsOpen = () => {
    setReaderOptions(!readerOptions);
  };

  const changeTextAlign = (alignment: string) => {
    setTextAlign(alignment);
  };

  const changeFontFamily = (font: string) => {
    setFontFamily(font);
  };

  const handleNavigateCloseChapter = async (chapterPageURL: string) => {
    try {
      router.navigate({ 
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
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
        <>
          <View style={[styles.header, { backgroundColor: overlayBackgroundColor, flexDirection: 'row' }]}>
            <Ionicons name={'arrow-back'} size={32} color={appliedTheme.colors.text} style={{ marginLeft: '2%' }} onPress={handleBackPress} />
            <Text style={{ color: appliedTheme.colors.text, fontSize: 20, marginBottom: 4, marginLeft: 12 }} numberOfLines={1}>{content.title}</Text>
          </View>
        </>
      )}
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.background }]} >
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
            <View>{content.closeChapterURL}</View>
            {content.content.map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.chapterText,
                  {
                    color: appliedTheme.colors.text,
                    fontSize: fontSize,
                    lineHeight: lineHeight,
                    textAlign: textAlign,
                    fontFamily: fontFamily,
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
          <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-around' }}>
            {content.closeChapters['prevChapter'] &&
              <Ionicons name={'arrow-back'} size={32} color={appliedTheme.colors.text} onPress={() => handleNavigateCloseChapter(content.closeChapters['prevChapter'])}/> 
            }
            <Ionicons name={'cog'} size={32} color={appliedTheme.colors.text} onPress={handleReaderOptionsOpen} />
            {content.closeChapters['nextChapter'] &&
              <Ionicons name={'arrow-forward'} size={32} color={appliedTheme.colors.text} onPress={() => handleNavigateCloseChapter(content.closeChapters['nextChapter'])}/>
            }
          </View>
        </View>
      )}

      {readerOptions && (
        <PullUpModal visible={readerOptions} onClose={handleReaderOptionsOpen}>
          <Text style={{ color: appliedTheme.colors.primary, fontSize: 24 }}>Reader options</Text>

          <View style={styles.pullupModalItemContainer}>
            <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text size</Text>
            <View style={styles.pullupModalItemContainerInner}>
              <Slider
                style={{ width: 200, height: 40 }}
                minimumValue={12}
                maximumValue={20}
                step={1}
                value={fontSize}
                onValueChange={value => setFontSize(value)}
                minimumTrackTintColor={appliedTheme.colors.primary}
                maximumTrackTintColor={appliedTheme.colors.text}
                thumbTintColor={appliedTheme.colors.primary} 
              />
              <Text style={{color: appliedTheme.colors.text}}>{fontSize}</Text>
            </View>
          </View>

          <View style={styles.pullupModalItemContainer}>
            <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Line height</Text>
            <View style={styles.pullupModalItemContainerInner}>
              <Slider
                style={{ width: 200, height: 40 }}
                minimumValue={18}
                maximumValue={32}
                step={1}
                value={lineHeight}
                onValueChange={value => setLineHeight(value)}
                minimumTrackTintColor={appliedTheme.colors.primary}
                maximumTrackTintColor={appliedTheme.colors.text}
                thumbTintColor={appliedTheme.colors.primary} 
              />
              <Text style={{color: appliedTheme.colors.text}}>{lineHeight}</Text>
            </View>
          </View>

          <View style={styles.pullupModalItemContainer}>
            <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text align</Text>
            <View style={styles.pullupModalItemContainerInner}>
              {['left', 'center', 'right', 'justify'].map((alignment) => (
                <TouchableOpacity key={alignment} onPress={() => changeTextAlign(alignment)}>
                  <MaterialIcons
                    size={28}
                    name={`format-align-${alignment}`}
                    color={appliedTheme.colors.text}
                    style={{
                      marginHorizontal: 12,
                      backgroundColor: textAlign === alignment ? appliedTheme.colors.primary : 'transparent',
                      borderRadius: 4,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.pullupModalItemContainer}>
            <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Font preset</Text>
            <View style={styles.pullupModalItemContainerInner}>
              <FlatList
                data={['serif', 'Roboto', 'monospace']}
                horizontal
                style={{marginLeft: 8}}
                keyExtractor={(item) => item}
                renderItem={({ item: font }) => (
                  <TouchableOpacity onPress={() => changeFontFamily(font)}>
                    <View style={[styles.fontPill, { backgroundColor: fontFamily === font ? appliedTheme.colors.primary : appliedTheme.colors.elevation.level3 }]}>
                      <Text style={{ color: appliedTheme.colors.text }}>{font}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false} // Hides the horizontal scroll bar
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }} // Align items
              />
            </View>
          </View>
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
    paddingBottom: 20,
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
  pullupModalItemContainer: {
    width: '100%',
    flexDirection: 'row',
    padding: 8,
  },
  pullupModalItemContainerInner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pullupModalSettingTitle: {
    fontSize: 18,
  },
  fontPill: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    height: 32,
  },
});
