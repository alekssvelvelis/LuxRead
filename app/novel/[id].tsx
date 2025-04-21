import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Share } from 'react-native';

import { useThemeContext } from '@/contexts/ThemeContext';
import { useNetwork } from '@/contexts/NetworkContext';
import getSourceFunctions from '@/utils/getSourceFunctions';

import { useLocalSearchParams, useRouter, useFocusEffect, usePathname } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import NovelHeader from '@/components/novel/NovelHeader';

import { PullUpModal } from '@/components/PullUpModal';
import { getAllNovelChapters, insertDownloadedChapter, getDownloadedChapters, isChapterDownloaded, getLibraryNovelForUpdateById, updateNovelData } from '@/database/ExpoDB';
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

interface novelProgress {
  id: number;
  novelId: number;
  readerProgress: number;
  chapterIndex: number;
}

interface FetchedNovel {
  id: number;
  title: string;
  author: string;
  description: string;
  genres: string | string[];
  chapterCount: number;
  imageURL: string;
  novelPageURL: string;
  novelSource: string;
  novelStatus: string;
}


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
  novelStatus: string,
};
const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const { isConnected } = useNetwork();
  const initialParameters = useLocalSearchParams<typeSearchParams>();
  const [novelData, setNovelData] = useState<typeSearchParams>(initialParameters);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [downloadedChapterList, setDownloadedChapterList] = useState<DownloadedChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [loadingTasks, setLoadingTasks] = useState(2);
  const [page, setPage] = useState<number>(1);
  const [hasMoreChapters, setHasMoreChapters] = useState<boolean>(true);

  const pathname = usePathname();
  const router = useRouter();
  const novelId = Number(novelData.id);
  const sourceName = novelData.sourceName;
  const genresArray = novelData.genres.split(',').map(genre => genre.trim());

  useEffect(() => {
    console.log('Current path:', pathname);
  }, [pathname]);
  
  const imageURL = useMemo(() => {
    return Array.isArray(novelData.imageURL) ? novelData.imageURL[0] : novelData.imageURL;
  }, [novelData.imageURL]);

  const handleLoadMore = () => {
    if (!loading && hasMoreChapters) {
      setPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [])

  const [fetchFunctions, setFetchFunctions] = useState<any>(null);

  const finishLoadingTask = () => {
    setLoadingTasks((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setLoading(false);
        setIsInitialLoading(false);
      }
      return newCount;
    });
  };

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
      setLoading(true);
      const newChapters = await fetchChaptersByPage(pageNumber);
      if (newChapters && newChapters.length > 0) {
          setChapterList((prevChapters) => [...prevChapters, ...newChapters]);
          setHasMoreChapters(newChapters.length > 0);
      } else {
          setHasMoreChapters(false);
      }
      finishLoadingTask();
    };
    if (fetchFunctions) {
      loadChapters(page);
    }
}, [fetchFunctions, page, novelData.novelPageURL]);

  useEffect(() => {
    const loadDownloadedChapters = async () => {
      // if (isConnected) {
      //   return;
      // }
      setLoading(true);
      try {
        const downloadedChapters = await getDownloadedChapters(novelId);
        // console.log(JSON.stringify(downloadedChapters, null, 2));
        if (downloadedChapters && downloadedChapters.length > 0) {
          setDownloadedChapterList(downloadedChapters);
        } else {
          setHasMoreChapters(false);
        }
      } catch (error) {
        console.log('Error thrown inside of novel/[id].tsx at fetchChapters', error);
      } finally {
        finishLoadingTask();
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
    // console.log(itemId, 'itemId in navigation');
    // console.log(readingProgress.chapterIndex, 'readingprogress chapterindex in navigation');
    try {
      router.navigate({
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
          title: novelData.title,
          sourceName: sourceName,
          ...(readingProgress.chapterIndex === itemId && { readerProgress: readingProgress.readerProgress}),
          ...(Number.isInteger(novelId) && { id: novelId}),
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadChapter = async (chapterPageURL: string, novelId: number) => {
    setDownloading(chapterPageURL);
    try {
      const chapters = await fetchFunctions.fetchChapterContent(chapterPageURL);
      const latestDownloadedRowId = await insertDownloadedChapter(chapters.title, chapters.content, chapterPageURL, novelId);
      typeof latestDownloadedRowId === 'number' ? setDownloadedChapterList((prevList) => [...prevList, {id: latestDownloadedRowId, title: chapters.title, content: chapters.content, chapterPageURL: chapterPageURL, novel_id: novelId}]) : false;
    } catch (error) {
      console.error("Error deleting novel:", error);
    } finally {
      setDownloading(null);
    }
  };

  const fetchChaptersByPage = async (pageNumber: number) => {
    if (!fetchFunctions) return [];
    try {
        return await fetchFunctions.fetchChapters(novelData.novelPageURL, pageNumber);
    } catch (error) {
        console.error('Error fetching chapters for page', pageNumber, error);
        return [];
    }
  };

  const fetchAllRequiredChapters = async (startIndex: number, endIndex: number) => {
    const chaptersPerPage = sourceName === 'LightNovelPub' ? 100 : 50;
    const startPage = Math.ceil(startIndex / chaptersPerPage);
    const endPage = Math.ceil(endIndex / chaptersPerPage);
    let fullChapterList = [...chapterList];
  
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
      const expectedFirstChapter = (pageNumber - 1) * chaptersPerPage;
      if (!fullChapterList[expectedFirstChapter]) {
        const newChapters = await fetchChaptersByPage(pageNumber);
        fullChapterList = [...fullChapterList, ...newChapters];
      }
    }
    return fullChapterList;
  };

  const handleMultipleChapterDownload = async (startIndex: number, endIndex: number) => {
    try {
      const fullChapterList = await fetchAllRequiredChapters(startIndex, endIndex);
      const chaptersToDownload = fullChapterList.slice(startIndex - 1, endIndex);
      
      for (let chapter of chaptersToDownload) {
        const alreadyDownloaded = await isChapterDownloaded(chapter.chapterPageURL, novelId);
        setDownloading(chapter.chapterPageURL);
        if (!alreadyDownloaded) {
          try {
            console.log('Downloading chapter:', chapter.chapterPageURL, 'with id', chapter.id);
            const chapterContent = await fetchFunctions.fetchChapterContent(chapter.chapterPageURL);
            const latestDownloadedRowId = await insertDownloadedChapter(chapterContent.title, chapterContent.content, chapter.chapterPageURL, novelId);
            latestDownloadedRowId ? setDownloadedChapterList((prevList) => [...prevList, {id: latestDownloadedRowId, title: chapterContent.title, content: chapterContent.content, chapterPageURL: chapter.chapterPageURL, novel_id: novelId}]) : false;
          } catch (error) {
            console.error(`Error downloading chapter ${chapter.chapterPageURL}`, error);
          } finally {
            console.log ('Downloaded all chapters');
          }
        } else {
          console.log('Skipping already downloaded chapter:', chapter.chapterPageURL);
        }
      }
    } catch (error) {
      console.error("Error downloading multiple chapters:", error);
    } finally {
      setDownloading(null);
    }
  };

  const shareNovel = async () => {
    try {
      await Share.share({
        message: `${novelData.novelPageURL}`,
      });
    } catch (error) {
      console.error('Error sharing novel');
    }
  }

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const localNovelData: FetchedNovel[] = await getLibraryNovelForUpdateById(novelId);
      const scrapedNovelData = await fetchFunctions.fetchSingleNovel(novelData.novelPageURL);
      
      let updatedData: any = { ...novelData };
  
      for (const key in localNovelData[0]) {
        if (Object.prototype.hasOwnProperty.call(localNovelData[0], key)) {
          const typedKey = key as keyof FetchedNovel;
          let scrapedValue = scrapedNovelData[typedKey];
          
          if (typedKey === 'genres' && Array.isArray(scrapedValue)) {
            scrapedValue = scrapedValue.join(",");
          }
  
          if (localNovelData[0][typedKey] !== scrapedValue) {
            updatedData[typedKey] = scrapedValue;
          }
        }
      }
      
      const differences = Object.keys(updatedData).reduce((diff, key) => {
        const typedKey = key as keyof FetchedNovel; 
        
        if (updatedData[typedKey] !== localNovelData[0][typedKey]) {  
          diff[typedKey] = updatedData[typedKey];
        }
        return diff;
      }, {} as Record<keyof FetchedNovel, any>);
      
      if (Object.keys(differences).length > 0) {
        await updateNovelData(novelId, differences);
        setNovelData(updatedData);
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFunctions, novelData.novelPageURL]);

  const RenderChapterItem = ({ item, index }: { item: Chapter, index: number }) => {
    const trueChapterIndex = item.title.match(/Chapter\s+(\d+)/) || '1';
    const chapterIndexOfItem = isConnected ? index+1 : Number(trueChapterIndex[1]);
    const defaultChapterIndex = readingProgress.chapterIndex || 0;
    const isChapterDownloaded = downloadedChapterList.some((chapterData) => chapterData.chapterPageURL === item.chapterPageURL);

    if(!isConnected){
      return (
        <TouchableOpacity key={item.title} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative', justifyContent: 'flex-start' }]} onPress={() => handleNavigateToChapter(item.chapterPageURL, chapterIndexOfItem)}>
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
    return (
      <TouchableOpacity key={item.title} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative' }]} onPress={() => handleNavigateToChapter(item.chapterPageURL, chapterIndexOfItem)}>
        {chapterIndexOfItem >= defaultChapterIndex && (
          <MaterialIcons name="adjust" size={16} color={appliedTheme.colors.primary} />
        )}
        <Text style={{ fontSize: 16, color: chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray', width: '80%', marginLeft: chapterIndexOfItem >= defaultChapterIndex ? 12 : 28, }} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        {chapterIndexOfItem === defaultChapterIndex && <Text style={{ position: 'absolute', color: appliedTheme.colors.text, top: 36, left: 28 }}>Reading progress: {readingProgress.readerProgress}%</Text>}
        
        {/* Conditionally render download icon */}
        {novelData.id !== "[id]" && (  // Check if novelData.id does not equal "[id]"
          downloading === item.chapterPageURL ? (
            <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
          ) : isChapterDownloaded ? (
            <MaterialIcons size={36} name="file-download-done" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : appliedTheme.colors.text} style={{ zIndex: 3 }} />
          ) : (
            <Ionicons size={36} name="download-outline" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : appliedTheme.colors.text} style={{ zIndex: 3 }} onPress={() => handleDownloadChapter(item.chapterPageURL, novelId)} />
          )
        )}
    </TouchableOpacity>
  );
  };

  const routerBack = () => router.back();
  const onReadPress = () => {
    if (chapterList.length === 0) return;
    if (readingProgress.chapterIndex > 0) {
      handleNavigateToChapter(chapterList[readingProgress.chapterIndex - 1].chapterPageURL, chapterList[readingProgress.chapterIndex - 1].id)
    } else {
      handleNavigateToChapter(chapterList[0].chapterPageURL, chapterList[0].id);
    }
  };

  if (isInitialLoading) return <View style={{backgroundColor: appliedTheme.colors.elevation.level2}}><NovelSkeleton/></View>;

  return (
    <View style={[styles.container, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
      {/* <RefreshNovelData /> */}
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
        ListHeaderComponent={
          <NovelHeader
            appliedTheme={appliedTheme}
            novelData={{...novelData, routerBack}}
            imageURL={imageURL}
            genresArray={genresArray}
            shareNovel={shareNovel}
            chapterList={chapterList}
            readingProgress={readingProgress}
            onReadPress={onReadPress}
            routerBack={routerBack}
            downloadMultipleChapters={handleMultipleChapterDownload}
          />
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
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
