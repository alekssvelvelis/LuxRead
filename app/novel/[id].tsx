import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { getSourceFunctions, getChapterSizes } from '@/utils/getSourceFunctions';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import NovelHeader from '@/components/novel/NovelHeader';
import NovelSkeleton from '@/components/skeletons/NovelSkeleton';
import { useNetwork } from '@/contexts/NetworkContext';

interface Chapter {
  id: number,
  title: string;
  chapterPageURL: string;
};

interface novelProgress {
  id: number;
  novelId: number;
  readerProgress: number;
  chapterIndex: number;
};

interface FetchedNovel {
  title: string;
  author: string;
  description: string;
  genres: string[];
  chapterCount: number;
  imageURL: string;
  novelPageURL: string;
  sourceName: string;
  novelStatus: string;
};

type typeSearchParams = {
  id: string,
  novelPageURL: string,
  sourceName: string,
};

const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const { isConnected } = useNetwork();
  const initialParameters = useLocalSearchParams<typeSearchParams>();
  const [novelData, setNovelData] = useState<FetchedNovel>();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [hasMoreChapters, setHasMoreChapters] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const router = useRouter();
  const sourceName = initialParameters.sourceName;
  const [fetchFunctions, setFetchFunctions] = useState<any>(null);

  useEffect(() => {
    if (sourceName) {
      try {
        const functions = getSourceFunctions(sourceName);
        setFetchFunctions(functions);
      } catch (error) {
        console.error('Error loading source functions:', error);
        setLoadError('Unable to load this novel source.');
        setInitialLoading(false);
      }
    } else {
      setLoadError('Novel source is missing.');
      setInitialLoading(false);
    }
  }, [sourceName]);

  let chaptersPerPage = getChapterSizes(sourceName);
  const loadingRef = useRef(false);

  const loadChapters = async (pageNumber: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const newChapters = await fetchChaptersByPage(pageNumber);
      if (newChapters && newChapters.length > 0) {
        setChapterList((prev) => [...prev, ...newChapters]);
        setHasMoreChapters(newChapters.length === chaptersPerPage);
        setPage(pageNumber);
      } else {
        setHasMoreChapters(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleLoadMoreChapters = () => {
    if (!hasMoreChapters || loadingRef.current) return;
    void loadChapters(page + 1);
  };

  useEffect(() => {
    const novelPageURL = initialParameters.novelPageURL;
    if (!novelPageURL) {
      setLoadError('Novel URL is missing.');
      setInitialLoading(false);
      return;
    }
    if (!fetchFunctions) {
      return;
    }

    let isActive = true;
    const fetchNovelData = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const fetchedNovelData = await fetchFunctions.fetchSingleNovel(novelPageURL);
        if (!fetchedNovelData) {
          throw new Error('The source returned no novel details.');
        }

        const description = Array.isArray(fetchedNovelData.descriptionText)
          ? fetchedNovelData.descriptionText.join('\n\n')
          : fetchedNovelData.description ?? '';
        const chapterCount = Number(fetchedNovelData.chapterCount ?? fetchedNovelData.totalChapters ?? 0);

        if (isActive) {
          setNovelData({
            title: fetchedNovelData.title ?? '',
            author: fetchedNovelData.author ?? '',
            description,
            genres: Array.isArray(fetchedNovelData.genres) ? fetchedNovelData.genres : [],
            chapterCount: Number.isFinite(chapterCount) ? chapterCount : 0,
            imageURL: fetchedNovelData.imageURL ?? '',
            novelPageURL,
            sourceName: sourceName ?? '',
            novelStatus: fetchedNovelData.novelStatus ?? fetchedNovelData.status ?? '',
          });
        }
      } catch (error) {
        console.error('Error loading novel data in novel/[id]:', error);
        if (isActive) {
          setLoadError('Unable to load novel details.');
        }
      } finally {
        if (isActive) {
          setInitialLoading(false);
        }
      }
    };

    void fetchNovelData();
    void loadChapters(page);

    return () => {
      isActive = false;
    };
  }, [fetchFunctions, initialParameters.novelPageURL, sourceName]);

  // useEffect(() => {
  //   const loadDownloadedChapters = async () => {
  //     // if (isConnected) {
  //     //   return;
  //     // }
  //     setLoading(true);
  //     try {
  //       const downloadedChapters = await getDownloadedChapters(novelId);
  //       // console.log(JSON.stringify(downloadedChapters, null, 2));
  //       if (downloadedChapters && downloadedChapters.length > 0) {
  //         setDownloadedChapterList(downloadedChapters);
  //       } else {
  //         setHasMoreChapters(false);
  //       }
  //     } catch (error) {
  //       console.log('Error thrown inside of novel/[id].tsx at fetchChapters', error);
  //     } finally {
  //       finishLoadingTask();
  //     }
  //   };
  //   loadDownloadedChapters();
  // }, [novelId]);

  const readingProgress: novelProgress = { id: 0, novelId: 0, readerProgress: 0, chapterIndex: 0 };
  // useFocusEffect(
  //   useCallback(() => {
  //   const fetchNovelProgress = async () => {
  //     try {
  //       const novelProgress: novelProgress = await getAllNovelChapters(novelData.title);
  //       if (!novelProgress) {
  //         return;
  //       }
  //       if (Array.isArray(novelProgress) && novelProgress.length > 0) {
  //         setReadingProgress(novelProgress[0]);
  //         return;
  //       }

  //       return;
  //     } catch (error) {
  //       console.error('Error fetching progress data about novel', error);
  //     }
  //   }
  //   fetchNovelProgress();
  //   }, [])
  // );

  const handleNavigateToChapter = async (chapterPageURL: string, itemId: number) => {
    try {
      router.navigate({
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
          title: novelData?.title,
          sourceName: sourceName,
          // ...(readingProgress.chapterIndex === itemId && { readerProgress: readingProgress.readerProgress}),
          // ...(Number.isInteger(novelId) && { id: novelId}),
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  // const handleDownloadChapter = async (chapterPageURL: string, novelId: number) => {
  //   setDownloading(chapterPageURL);
  //   try {
  //     const chapters = await fetchFunctions.fetchChapterContent(chapterPageURL);
  //     console.log(chapters, chapterPageURL, novelId);
  //     const latestDownloadedRowId = await insertDownloadedChapter(chapters.title, chapters.content, chapterPageURL, novelId);
  //     typeof latestDownloadedRowId === 'number' ? setDownloadedChapterList((prevList) => [...prevList, {id: latestDownloadedRowId, title: chapters.title, content: chapters.content, chapterPageURL: chapterPageURL, novel_id: novelId}]) : false;
  //   } catch (error) {
  //     console.error("Error deleting novel:", error);
  //   } finally {
  //     setDownloading(null);
  //   }
  // };

  const fetchChaptersByPage = async (pageNumber: number) => {
    if (!fetchFunctions) return [];
    if (!isConnected) return [];
    try {
        return await fetchFunctions.fetchChapters(initialParameters.novelPageURL, pageNumber);
    } catch (error) {
        console.error('Error fetching chapters for page', pageNumber, error);
        return [];
    }
  };

  // const fetchAllRequiredChapters = async (startIndex: number, endIndex: number) => {
  //   const chaptersPerPage = sourceName === 'LightNovelPub' ? 100 : 50;
  //   const startPage = Math.ceil(startIndex / chaptersPerPage);
  //   const endPage = Math.ceil(endIndex / chaptersPerPage);
  //   let fullChapterList = [...chapterList];
  
  //   for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
  //     const expectedFirstChapter = (pageNumber - 1) * chaptersPerPage;
  //     if (!fullChapterList[expectedFirstChapter]) {
  //       const newChapters = await fetchChaptersByPage(pageNumber);
  //       fullChapterList = [...fullChapterList, ...newChapters];
  //     }
  //   }
  //   return fullChapterList;
  // };

  const handleMultipleChapterDownload = (_startIndex: number, _endIndex: number) => {
    // try {
    //   const fullChapterList = await fetchAllRequiredChapters(startIndex, endIndex);
    //   const chaptersToDownload = fullChapterList.slice(startIndex - 1, endIndex);
      
    //   for (let chapter of chaptersToDownload) {
    //     const alreadyDownloaded = await isChapterDownloaded(chapter.chapterPageURL, novelId);
    //     setDownloading(chapter.chapterPageURL);
    //     if (!alreadyDownloaded) {
    //       try {
    //         console.log('Downloading chapter:', chapter.chapterPageURL, 'with id', chapter.id);
    //         const chapterContent = await fetchFunctions.fetchChapterContent(chapter.chapterPageURL);
    //         const latestDownloadedRowId = await insertDownloadedChapter(chapterContent.title, chapterContent.content, chapter.chapterPageURL, novelId);
    //         latestDownloadedRowId ? setDownloadedChapterList((prevList) => [...prevList, {id: latestDownloadedRowId, title: chapterContent.title, content: chapterContent.content, chapterPageURL: chapter.chapterPageURL, novel_id: novelId}]) : false;
    //       } catch (error) {
    //         console.error(`Error downloading chapter ${chapter.chapterPageURL}`, error);
    //       } finally {
    //         console.log ('Downloaded all chapters');
    //       }
    //     } else {
    //       console.log('Skipping already downloaded chapter:', chapter.chapterPageURL);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error downloading multiple chapters:", error);
    // } finally {
    //   setDownloading(null);
    // }
  };

  const shareNovel = async () => {
    try {
      await Share.share({
        message: initialParameters.novelPageURL ?? '',
      });
    } catch (error) {
      console.error('Error sharing novel');
    }
  }

  const RenderChapterItem = ({ item, index }: { item: Chapter, index: number }) => {
    const trueChapterIndex = item.title.match(/Chapter\s+(\d+)/) || '1';
    const chapterIndexOfItem = isConnected ? index+1 : Number(trueChapterIndex[1]);
    const defaultChapterIndex = readingProgress.chapterIndex || 0;
    // const isChapterDownloaded = downloadedChapterList.some((chapterData) => chapterData.chapterPageURL === item.chapterPageURL);

    if(!isConnected){
      return (
        <TouchableOpacity key={`${item.chapterPageURL}${index}`} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative', justifyContent: 'flex-start' }]} onPress={() => handleNavigateToChapter(item.chapterPageURL, chapterIndexOfItem)}>
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
      <TouchableOpacity key={`${item.chapterPageURL}${index}`} style={[styles.chapterContainer, { paddingVertical: 12, position: 'relative' }]} onPress={() => handleNavigateToChapter(item.chapterPageURL, chapterIndexOfItem)}>
        {chapterIndexOfItem >= defaultChapterIndex && (
          <MaterialIcons name="adjust" size={16} color={appliedTheme.colors.primary} />
        )}
        <Text style={{ fontSize: 16, color: chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : 'gray', width: '80%', marginLeft: chapterIndexOfItem >= defaultChapterIndex ? 12 : 28, }} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        {chapterIndexOfItem === defaultChapterIndex && <Text style={{ position: 'absolute', color: appliedTheme.colors.text, top: 36, left: 28 }}>Reading progress: {readingProgress.readerProgress}%</Text>}
        
        {/* Conditionally render download icon */}
        {/* {novelData.id !== "[id]" && (  // Check if novelData.id does not equal "[id]"
          downloading === item.chapterPageURL ? (
            <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
          ) : isChapterDownloaded ? (
            <MaterialIcons size={36} name="file-download-done" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : appliedTheme.colors.text} style={{ zIndex: 3 }} />
          ) : (
            <Ionicons size={36} name="download-outline" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : appliedTheme.colors.text} style={{ zIndex: 3 }} onPress={() => handleDownloadChapter(item.chapterPageURL, novelId)} />
          )
        )} */}
    </TouchableOpacity>
    );
  };

  const routerBack = () => router.back();
  const onReadPress = () => {
    return;
    // if(isConnected){
    //   if(chapterList.length === 0) return;

    //   if (readingProgress.chapterIndex > 0) {
    //     handleNavigateToChapter(chapterList[readingProgress.chapterIndex - 1].chapterPageURL, chapterList[readingProgress.chapterIndex - 1].id)
    //   } else {
    //     handleNavigateToChapter(chapterList[0].chapterPageURL, chapterList[0].id);
    //   }
    // } else {
    //   return;
    // }
  };

  // if (isInitialLoading) return <View style={{backgroundColor: appliedTheme.colors.elevation.level2}}><NovelSkeleton/></View>;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
      {initialLoading ? (
        <NovelSkeleton />
      ) : loadError || !novelData ? (
        <Text style={{ color: appliedTheme.colors.text, textAlign: 'center' }}>
          {loadError ?? 'Novel details are unavailable.'}
        </Text>
      ) : (
        <FlatList
          data={isConnected ? chapterList : chapterList}
          renderItem={RenderChapterItem}
          keyExtractor={(item, index) => `${item.chapterPageURL}-${index}`}
          onEndReached={() => void handleLoadMoreChapters()}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading ? (
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
              novelData={novelData}
              imageURL={novelData.imageURL}
              genresArray={novelData.genres}
              shareNovel={shareNovel}
              chapterList={chapterList}
              readingProgress={readingProgress}
              onReadPress={onReadPress}
              routerBack={routerBack}
              downloadMultipleChapters={handleMultipleChapterDownload}
            />
          }
      // refreshing={refreshing}
      // onRefresh={onRefresh}
        />
      )}
      </View>
    </>
  );
};

export default Synopsis;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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