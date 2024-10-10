import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';

import { useThemeContext } from '@/contexts/ThemeContext';
import getSourceFunctions from '@/utils/getSourceFunctions';

import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from 'expo-image'; //  takes priority over react-native image tag to read static images

import { PullUpModal } from '@/components/PullUpModal';
import { fetchChapters } from '@/sources/AllNovelFull';
import { getAllNovelChapters } from '@/database/ExpoDB';
interface Chapter {
  title: string;
  url: string;
}
interface novelProgress{
  id: number;
  novelId: number;
  readerProgress: number;
  chapterIndex: number;
}
const Synopsis = () => {
  const { sourceName } = useLocalSearchParams();
  console.log('test123', sourceName);
  const { appliedTheme } = useThemeContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const [chapterList, setChapterList] = useState<Chapter[]>([]); // Holds the loaded chapters
  const [loading, setLoading] = useState(false); // Loading state
  const [page, setPage] = useState(1); // Page for chapter pagination
  const [hasMoreChapters, setHasMoreChapters] = useState(true); // Track if more chapters exist

  const router = useRouter();

  const toggleRotation = () => {
    Animated.timing(rotation, {
      toValue: isRotated ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsRotated(!isRotated);
    setIsModalVisible(!isModalVisible);
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  const novelData = useLocalSearchParams();
  // console.log(JSON.stringify(novelData,null,2));
  const genresArray = novelData.genres.split(',').map(genre => genre.trim());
  const imageURL = Array.isArray(novelData.imageURL) ? novelData.imageURL[0] : novelData.imageURL;
  const [showFullDescription, setShowFullDescription] = useState(false);
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleLoadMore = () => {
    if (!loading && hasMoreChapters) {
      setPage(prevPage => prevPage + 1);
    }
  };

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

  useEffect(() => {
    const loadChapters = async (pageNumber = 1) => {
      if (!fetchFunctions) {
        return;
      }

      setLoading(true);

      try {
        const chapters = await fetchFunctions.fetchChapters(novelData.url, pageNumber);
        if (chapters && chapters.length > 0) {
          setChapterList((prevChapters) => [...prevChapters, ...chapters]);
          setHasMoreChapters(chapters.length > 0);
        } else {
          setHasMoreChapters(false);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    };
    if (fetchFunctions) {
      loadChapters(page);
    }
  }, [fetchFunctions, page, novelData.url]);

  const [chapterIndex, setChapterIndex] = useState(null);
  const [readerProgress, setReaderProgress] = useState(null);

  useFocusEffect(
    useCallback(() => {
    const fetchNovelProgress = async () => {
      try {
        const novelProgress: novelProgress = await getAllNovelChapters(novelData.title);
        if (!novelProgress) {
          return;
        }
        if (Array.isArray(novelProgress) && novelProgress.length === 0) {
          console.log('Empty progress array');
          return;
        }
        setChapterIndex(novelProgress[0].chapterIndex);
        setReaderProgress(novelProgress[0].readerProgress);
        return;
      } catch (error) {
        console.error('Error fetching progress data about novel', error);
      }
    }
    fetchNovelProgress();
    return () => {
      console.log('This novel is now unfocused.');
    }
    }, [])
  );

  const handleNavigateToChapter = async (chapterPageURL: string) => {
    try {
      router.navigate({ 
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
          title: novelData.title,
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };
  // console.log(JSON.stringify(chapterList, null, 2));
  const renderChapterItem = ({ item, index }: { item: Chapter, index: number }) => {
    const chapterIndexOfItem = index + 1;
    const defaultChapterIndex = chapterIndex || 0;
    return(
      <TouchableOpacity key={item.title} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative' }]} onPress={() => handleNavigateToChapter(item.url)}>
        <Text style={{ fontSize: 16, color: chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray', width: '90%' }} numberOfLines={1} ellipsizeMode='tail'>
          {item.title}
        </Text>
        {chapterIndexOfItem === defaultChapterIndex && <Text style={{position: 'absolute', color: appliedTheme.colors.text, top: 40, left: 0}}>Reading progress: {readerProgress}%</Text>}
        <MaterialIcons size={36} name="download" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray'} style={{ zIndex: 3 }} />
      </TouchableOpacity>
    );
  };
  const renderListHeader = () => (
    <View style={{minWidth: '100%'}}>
      <Stack.Screen
        options={{
          headerTitle: `${novelData.title}`,
          headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
          headerTintColor: appliedTheme.colors.text,
        }}
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.textContainer, { marginVertical: 24, }]}>
          <Text style={[styles.title, styles.moveRight, { color: appliedTheme.colors.text }]}>{novelData.title}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons size={20} name="person-outline" style={styles.moveRight} color={appliedTheme.colors.text} />
            <Text style={[styles.chapters, { color: appliedTheme.colors.text }]}>{novelData.author}</Text>
          </View>
          <FlatList
            data={genresArray}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.genreContainer, {} ]}
            renderItem={({ item }) => (
              <View style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
                <Text style={[styles.genreText, { color: appliedTheme.colors.text }]}>{item}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageURL }} style={[styles.image]} contentFit='contain' />
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={[styles.description, { color: appliedTheme.colors.text }]} numberOfLines={showFullDescription ? undefined : 3}>
          {novelData.description}
        </Text>
        <TouchableOpacity onPress={toggleDescription} style={styles.toggleButton}>
          <Text style={[styles.toggleButtonText, { color: appliedTheme.colors.primary }]}>
            {showFullDescription ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      </View>
      {chapterList.length > 0 && (
        <TouchableOpacity 
        style={[styles.readingButton, { backgroundColor: appliedTheme.colors.primary, justifyContent: 'center', alignItems: 'center' }]} 
        onPress={() => chapterIndex > 0 ? handleNavigateToChapter(chapterList[chapterIndex - 1].url) : handleNavigateToChapter(chapterList[0].url)}>
          <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text }]} numberOfLines={1} ellipsizeMode='tail'>
            {chapterIndex > 0 ? `Continue reading ${chapterList[chapterIndex-1].title}` : `Start reading ${chapterList[0].title}`}
          </Text>
        </TouchableOpacity>
      )}
       <View style={{ flexDirection: 'row'}}>
        <View style={[styles.chapterContainer, {}]}>
          <Text style={[styles.totalChapters, { color: appliedTheme.colors.text }]}>Chapters: {novelData.chapterCount}</Text>
          <TouchableOpacity onPress={toggleRotation}>
            <Animated.View style={[animatedStyle]}>
              <MaterialIcons size={36} name="keyboard-double-arrow-down" color={appliedTheme.colors.text}/> 
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: appliedTheme.colors.background}]}>
      <FlatList
        data={chapterList}
        renderItem={renderChapterItem}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
          ) : !hasMoreChapters ? (
            <Text style={{ textAlign: 'center', color: appliedTheme.colors.text, marginTop: 24 }}>No more chapters</Text>
          ) : null
        }
        ListHeaderComponent={renderListHeader}
      />
      <PullUpModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          toggleRotation();
        }}
      >
        <Text>abcdefg</Text>
      </PullUpModal>
    </View>
  );
};

export default Synopsis;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 8,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 0.5,
    alignItems: 'center',
  },
  image: {
    width: 175,
    height: 175,
    marginVertical: 12,
  },
  title: {
    fontSize: 22,
    marginTop: 24,
    fontWeight: 'bold',
  },
  chapters: {
    fontSize: 14,
  },
  moveRight: {
    marginTop: 0,
    marginBottom: 2,
    marginLeft: 8,
    marginRight: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  genrePill: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    height: 32,
  },
  genreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginHorizontal: 8,
    marginVertical: 12,
    width: '95%',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  toggleButton: {
    marginTop: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  readingButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    minHeight: 52,
    borderRadius: 50,
    zIndex: 1,
    width: '90%',
    overflow: 'hidden',
  },
  readingButtonText: {
    fontSize: 16,
  },
  chapterContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalChapters: {
    fontSize: 24
  },
});
