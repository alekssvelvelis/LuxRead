import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';

import { useThemeContext } from '@/contexts/ThemeContext';
import { useNetwork } from '@/contexts/NetworkContext';
import getSourceFunctions from '@/utils/getSourceFunctions';

import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from 'expo-image'; //  takes priority over react-native image tag to read static images

import { PullUpModal } from '@/components/PullUpModal';
import { getAllNovelChapters, insertDownloadedChapter, getDownloadedChapters } from '@/database/ExpoDB';
import NovelSkeleton from '@/components/skeletons/NovelSkeleton';

interface Chapter {
  id: number,
  title: string;
  chapterPageURL: string;
};

interface DownloadedChapter {
  id: number,
  title: string;
  content: string | string[];
  chapterPageURL: string;
  novel_id: number,
};

interface novelProgress{
  id: number;
  novelId: number;
  readerProgress: number;
  chapterIndex: number;
};

type typeSearchParams = {
  id: string,
  imageURL: string,
  description: string,
  author: string,
  genres: string,
  novelPageURL: string,
  sourceName: string,
  title: string,
  chapterCount: string,
};
const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const { isConnected } = useNetwork();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [downloadedChapterList, setDownloadedChapterList] = useState<DownloadedChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMoreChapters, setHasMoreChapters] = useState<boolean>(true);

  const router = useRouter();

  const novelData = useLocalSearchParams<typeSearchParams>();
  const novelId = Number(novelData.id);
  const sourceName = novelData.sourceName;
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
        const chapters = await fetchFunctions.fetchChapters(novelData.novelPageURL, pageNumber);
        if (chapters && chapters.length > 0) {
          setChapterList((prevChapters) => [...prevChapters, ...chapters]);
          setHasMoreChapters(chapters.length > 0);
        } else {
          setHasMoreChapters(false);
        }
      } catch (error) {
        console.log('Error thrown inside of novel/[id].tsx at fetchChapters', error);
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };
    if (fetchFunctions) {
      loadChapters(page);
    }
  }, [fetchFunctions, page, novelData.novelPageURL]);

  useEffect(() => {
    const loadDownloadedChapters = async () => {
      if (isConnected) {
        return;
      }
      setLoading(true);
      try {
        const downloadedChapters = await getDownloadedChapters(novelId);
        // console.log(JSON.stringify(downloadedChapters, null, 2));
        if (downloadedChapters && downloadedChapters.length > 0) {
          setDownloadedChapterList(downloadedChapters);
          // console.log(JSON.stringify(downloadedChapters,null,2));
        } else {
          setHasMoreChapters(false);
        }
      } catch (error) {
        console.log('Error thrown inside of novel/[id].tsx at fetchChapters', error);
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };
    loadDownloadedChapters();
  }, [novelId]);
  const [readingProgress, setReadingProgress] = useState<novelProgress>({ id: 0, novelId: 0, readerProgress: 0, chapterIndex: 0 });
  useFocusEffect(
    useCallback(() => {
    const fetchNovelProgress = async () => {
      try {
        const novelProgress: novelProgress = await getAllNovelChapters(novelData.title);
        console.log(JSON.stringify(novelProgress, null, 2));
        if (!novelProgress) {
          return;
        }
        if (Array.isArray(novelProgress) && novelProgress.length > 0) {
          setReadingProgress(novelProgress[0]);
          return;
        }

        return;
      } catch (error) {
        console.error('Error fetching progress data about novel', error);
      }
    }
    fetchNovelProgress();
    }, [])
  );

  const handleNavigateToChapter = async (chapterPageURL: string, itemId: number) => {
    // if(!isConnected){
    //   const relevantChapterData = downloadedChapterList.find(chapter => chapter.chapterPageURL === chapterPageURL);
    // }
    try {
      router.navigate({
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
          title: novelData.title,
          sourceName: sourceName,
          ...(readingProgress.chapterIndex === itemId+1 && { readerProgress: readingProgress.readerProgress}),
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };
  const [downloading, setDownloading] = useState(false);
  const handleDownloadChapter = async (chapterPageURL: string, novelId: number) => {
    setDownloading(true);
    try {
      const chapters = await fetchFunctions.fetchChapterContent(chapterPageURL);
      // console.log(chapters.content, 'asd123');
      await insertDownloadedChapter(chapters.title, chapters.content, chapterPageURL, novelId);
    } catch (error) {
      console.error("Error deleting novel:", error);
    } finally {
      setDownloading(false);
    }
  };

  const RenderChapterItem = ({ item, index }: { item: Chapter, index: number }) => {
    const trueChapterIndex = item.title.match(/Chapter\s+(\d+)/);
    const chapterIndexOfItem = isConnected ? index+1 : Number(trueChapterIndex[1]);
    const defaultChapterIndex = readingProgress.chapterIndex || 0;
    if(!isConnected){
      return (
        <TouchableOpacity key={item.title} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative', justifyContent: 'flex-start' }]} onPress={() => handleNavigateToChapter(item.chapterPageURL, index)}>
        {chapterIndexOfItem >= defaultChapterIndex && (
            <MaterialIcons 
              name="adjust"
              size={16}
              color={appliedTheme.colors.primary} 
            />
          )}
        <Text style={{ fontSize: 16, color: chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray', width: '80%', marginLeft: chapterIndexOfItem >= defaultChapterIndex ? 8 : 22, }} numberOfLines={1} ellipsizeMode='tail'>
          {item.title}
        </Text>
        {chapterIndexOfItem === defaultChapterIndex && <Text style={{position: 'absolute', color: appliedTheme.colors.text, top: 34, left: 24}}>Reading progress: {readingProgress.readerProgress}%</Text>}
        </TouchableOpacity>
      );
    }
    return(
      <TouchableOpacity key={item.title} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative' }]} onPress={() => handleNavigateToChapter(item.chapterPageURL, index)}>
        {chapterIndexOfItem >= defaultChapterIndex && (
            <MaterialIcons 
              name="adjust"
              size={16}
              color={appliedTheme.colors.primary} 
              style={{  }} 
            />
          )}
        <Text style={{ fontSize: 16, color: chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray', width: '80%', marginLeft: chapterIndexOfItem >= defaultChapterIndex ? 12 : 28 }} numberOfLines={1} ellipsizeMode='tail'>
          {item.title}
        </Text>
        {chapterIndexOfItem === defaultChapterIndex && <Text style={{position: 'absolute', color: appliedTheme.colors.text, top: 34, left: 28}}>Reading progress: {readingProgress.readerProgress}%</Text>}
        {novelData.id === "[id]" 
        ? 
        null
        : ( downloading && defaultChapterIndex === chapterIndexOfItem ? <ActivityIndicator size="large" color={appliedTheme.colors.primary}/> : (
              <Ionicons size={36} name="download-outline" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray'} style={{ zIndex: 3 }} onPress={() => handleDownloadChapter(item.chapterPageURL, novelId)}/> 
            )
          )
        }
      </TouchableOpacity>
    );
  };

  const RenderListHeader = () => (
    
    <View style={{minWidth: '100%'}}>
      {/* <Stack.Screen
        options={{
          headerTitle: `${novelData.title}`,
          headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
          headerTintColor: appliedTheme.colors.text,
          headerShown: true,
        }}
      /> */}
      <Appbar.Header
      mode='small'
        style={{ backgroundColor: appliedTheme.colors.elevation.level2 }}
      >
        <Appbar.BackAction onPress={() => { router.back() }} color={appliedTheme.colors.text} style={{marginLeft: -8}}/>
        <Appbar.Content title={novelData.title} titleStyle={{ color: appliedTheme.colors.text }} />
      </Appbar.Header>
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
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.genreContainer, {} ]}
            renderItem={({ item }) => (
              <View style={[styles.genrePill, { backgroundColor: appliedTheme.colors.primary }]}>
                <Text style={[styles.genreText, { color: appliedTheme.colors.text }]}>{item}</Text>
              </View>
            )}
          />
          <View style={{ flexDirection: 'row' }}>
            <Ionicons size={24} name="book-outline" style={styles.moveRight} color={appliedTheme.colors.text} />
            <Text style={[styles.chapters, { color: appliedTheme.colors.text, fontSize: 16 }]}>{novelData.chapterCount} Chapters</Text>
          </View>
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
        onPress={() => readingProgress.chapterIndex > 0 ? handleNavigateToChapter(chapterList[readingProgress.chapterIndex - 1].chapterPageURL, chapterList[readingProgress.chapterIndex-1].id) : handleNavigateToChapter(chapterList[0].chapterPageURL, chapterList[0].id)}>
          <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text }]} numberOfLines={1} ellipsizeMode='tail'>
            {readingProgress.chapterIndex > 0 ? `Continue reading ${chapterList[readingProgress.chapterIndex-1].title}` : `Start reading ${chapterList[0].title}`}
          </Text>
        </TouchableOpacity>
      )}
       <View style={{ flexDirection: 'row'}}>
      </View>
    </View>
  );

  if (isInitialLoading) return <View style={{backgroundColor: appliedTheme.colors.background}}><NovelSkeleton/></View>;

  return (
    <View style={[styles.container, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
      <FlatList
        data={isConnected ? chapterList : downloadedChapterList}
        renderItem={RenderChapterItem}
        keyExtractor={(index) => index.title}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loading && !isInitialLoading ? (
            <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
          ) : !isConnected ? (
            <Text style={{ textAlign: 'center', color: appliedTheme.colors.text, marginTop: 24 }}>You're offline, these are your downloaded chapters</Text>
          ) : !hasMoreChapters && isConnected ? (
            <Text style={{ textAlign: 'center', color: appliedTheme.colors.text, marginTop: 24 }}>No more chapters</Text>
          ) : null
        }
        ListHeaderComponent={RenderListHeader}
      />
      
      <PullUpModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
      >
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
    marginTop: 0,
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
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  totalChapters: {
    fontSize: 24
  },
});
