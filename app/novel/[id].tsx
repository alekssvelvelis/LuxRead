import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { getSourceFunctions, getChapterSizes } from '@/utils/getSourceFunctions';

import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

import NovelHeader from '@/components/novel/NovelHeader';
import NovelSkeleton from '@/components/skeletons/NovelSkeleton';
import { useNetwork } from '@/contexts/NetworkContext';
import { getAllNovelChapters, insertDownloadedChapter, getDownloadedChapters, isChapterDownloaded, getLibraryNovelById } from '@/database/ExpoDB';

interface Chapter {
  id: number,
  title: string;
  chapterPageURL: string;
};

interface novelProgress {
  id: number;
  novel_id: string;
  readerProgress: number;
  chapterIndex: number;
};


interface FetchedNovel {
  title: string;
  author: string;
  description: string;
  genres: string | string[];
  chapterCount: number;
  imageURL: string;
  novelPageURL: string;
  novelSource: string;
  novelStatus: string;
};


type typeSearchParams = {
  id: string,
  novelId: string,
  novelPageURL: string,
  novelSource: string,
  novelIsSaved: string
};

const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const { isConnected } = useNetwork();
  const isOffline = isConnected === false;

  const initialParameters = useLocalSearchParams<typeSearchParams>();
  const { id, novelPageURL, novelSource, novelIsSaved } = initialParameters;
  const isSaved = novelIsSaved === "true";

  const [novelData, setNovelData] = useState<FetchedNovel>();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [downloadedChapters, setDownloadedChapters] = useState<Chapter[]>([]);
  const [hasMoreChapters, setHasMoreChapters] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const router = useRouter();
  const [fetchFunctions, setFetchFunctions] = useState<any>(null);

  useEffect(() => {
    if (novelSource) {
      try {
        const functions = getSourceFunctions(novelSource);
        setFetchFunctions(functions);
      } catch (error) {
        console.error('Error loading source functions:', error);
        setLoadError('Unable to load this novel source.');
        setInitialLoading(false);
      }
    } else {
      console.log(initialParameters);
      setLoadError('Novel source is missing.');
      setInitialLoading(false);
    }
  }, [novelSource]);

  const chaptersPerPage = getChapterSizes(novelSource);
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

  const fromLocal = (novel: FetchedNovel) => ({
    title: novel.title ?? '',
    author: novel.author ?? '',
    description: novel.description,
    genres: Array.isArray(novel.genres) ? novel.genres : novel.genres.split(","),
    chapterCount: novel.chapterCount,
    imageURL: novel.imageURL ?? '',
    novelPageURL: novel.novelPageURL,
    novelSource: novel.novelSource ?? '',
    novelStatus: novel.novelStatus ?? '',
  }); 

  const fromRemote = (novel: any, novelPageURL: string, novelSource: string,) => ({
    title: novel.title ?? '',
    author: novel.author ?? '',
    description: novel.descriptionText,
    genres: Array.isArray(novel.genres) ? novel.genres : [],
    chapterCount:  Number(novel.chapterCount ?? novel.totalChapters ?? 0),
    imageURL: novel.imageURL ?? '',
    novelPageURL,
    novelSource,
    novelStatus: novel.novelStatus ?? '',
  }); 

  useEffect(() => {
    if (!novelPageURL) {
      setLoadError('Novel URL is missing.');
      setInitialLoading(false);
      return;
    }
    if (!fetchFunctions && !isOffline) return;

    let isActive = true;

    const loadNovel = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const [localNovel] = await getLibraryNovelById(id);
        if (localNovel) {
          if (isActive) setNovelData(fromLocal(localNovel));
          return;
        }
        const remote = await fetchFunctions!.fetchSingleNovel(novelPageURL);
        if (!remote) {
          throw new Error('The source returned no novel details.');
        }
        if (isActive) {
          setNovelData(fromRemote(remote, novelPageURL, novelSource ?? ''));
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

    const loadDownloadedChapters = async () => {
      try {
        const downloaded = await getDownloadedChapters(id);
        if (isActive && downloaded && downloaded.length > 0) {
          setDownloadedChapters(downloaded);
        }
      } catch (error) {
        console.log('Error thrown inside of novel/[id].tsx at fetchChapters', error);
      }
    };

    void loadNovel();
    void loadDownloadedChapters();
    void loadChapters(1);

    return () => {
      isActive = false;
    };
  }, [id, novelPageURL, novelSource, fetchFunctions, isOffline]);

  const [readingProgress, setReadingProgress] = useState<novelProgress>({
    id: 0, novel_id: '', readerProgress: 0, chapterIndex: 0,
  });

  useFocusEffect(
    useCallback(() => {
      if (!novelData) return; // wait until data exists
      let cancelled = false;

      const fetchNovelProgress = async () => {
        try {
          const result = await getAllNovelChapters(
            `${novelData.title}-${novelData.novelSource}`
          );
          if (cancelled) return;
          if (Array.isArray(result) && result.length > 0) {
            setReadingProgress(result[0]);
          }
        } catch (error) {
          console.error('Error fetching progress data about novel', error);
        }
      };

      fetchNovelProgress();

      // Runs when the screen loses focus or the deps change
      return () => {
        cancelled = true;
      };
    }, [novelData?.title, novelData?.novelSource])
  );

  // console.log(novelData);

  const handleNavigateToChapter = async (chapterPageURL: string, itemId: number) => {
    try {
      router.navigate({
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        pathname: `chapter/[id]`, 
        params: {
          id: `${novelData?.title}-${novelData?.novelSource}`,
          chapterPageURL: chapterPageURL,
          title: novelData?.title,
          novelSource: novelSource,
          ...(readingProgress.chapterIndex === itemId && { readerProgress: readingProgress.readerProgress}),
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  const [isDownloading, setDownloading] = useState<string>('');

  const handleDownloadChapter = async (chapterPageURL: string, novelId: string) => {
    setDownloading(chapterPageURL);
    try {
      const chapters = await fetchFunctions.fetchChapterContent(chapterPageURL);
      await insertDownloadedChapter(chapters.title, chapters.content, chapterPageURL, novelId);
      const latestDownloadedRowId = await insertDownloadedChapter(chapters.title, chapters.content, chapterPageURL, novelId);
      typeof latestDownloadedRowId === 'number' ? setDownloadedChapters((prevList) => [...prevList, {id: latestDownloadedRowId, title: chapters.title, chapterPageURL: chapterPageURL, novel_id: novelId}]) : false;
    } catch (error) {
      console.error("Error deleting novel:", error);
    } finally {
      setDownloading('');
    }
  };

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

  const fetchAllRequiredChapters = async (startIndex: number, endIndex: number) => {
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
        const alreadyDownloaded = await isChapterDownloaded(chapter.chapterPageURL, id);
        setDownloading(chapter.chapterPageURL); 
        if (!alreadyDownloaded) {
          try {
            console.log('Downloading chapter:', chapter.chapterPageURL, 'with id', chapter.id);
            const chapterContent = await fetchFunctions.fetchChapterContent(chapter.chapterPageURL);
            const latestDownloadedRowId = await insertDownloadedChapter(chapterContent.title, chapterContent.content, chapter.chapterPageURL, id);
            latestDownloadedRowId ? setDownloadedChapters((prevList) => [...prevList, {id: latestDownloadedRowId, title: chapterContent.title, content: chapterContent.content, chapterPageURL: chapter.chapterPageURL, novel_id: id}]) : false;
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
      setDownloading('');
    }
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
    const isChapterDownloaded = downloadedChapters.some((chapterData) => chapterData.chapterPageURL === item.chapterPageURL);

    if (!isConnected) {
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
        {isSaved && (
          isDownloading === item.chapterPageURL ? (
            <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
          ) : isChapterDownloaded ? (
            <MaterialIcons size={36} name="file-download-done" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : appliedTheme.colors.text} style={{ zIndex: 3 }} />
          ) : (
            <Ionicons size={36} name="download-outline" color={chapterIndexOfItem >= defaultChapterIndex ? appliedTheme.colors.text : appliedTheme.colors.text} style={{ zIndex: 3 }} onPress={() => handleDownloadChapter(item.chapterPageURL, id)} />
          )
        )}
    </TouchableOpacity>
    );
  };

  const routerBack = () => router.back();
  const onReadPress = () => {
    if(isConnected){
      if(chapterList.length === 0) return;
      if (readingProgress.chapterIndex > 0) {
        handleNavigateToChapter(chapterList[readingProgress.chapterIndex - 1].chapterPageURL, chapterList[readingProgress.chapterIndex - 1].id)
      } else {
        handleNavigateToChapter(chapterList[0].chapterPageURL, chapterList[0].id);
      }
    } else {
      return;
    }
  };

  if (initialLoading) return <View style={{backgroundColor: appliedTheme.colors.elevation.level2}}><NovelSkeleton/></View>;

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
          data={isConnected ? chapterList : downloadedChapters}
          renderItem={RenderChapterItem}
          keyExtractor={(item, index) => `${item.chapterPageURL}-${index}`}
          onEndReached={() => void handleLoadMoreChapters()}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
            ) : !isConnected ? (
              <Text style={{ textAlign: 'center', color: appliedTheme.colors.text, marginTop: 24 }}>You're offline, these are your downloaded chapters</Text>
            ) : !hasMoreChapters ? (
              <Text style={{ textAlign: 'center', color: appliedTheme.colors.text, marginTop: 24 }}>No more chapters</Text>
            ) : null
          }
          ListHeaderComponent={
            <NovelHeader
              novelId={isSaved ? id : ''}
              appliedTheme={appliedTheme}
              novelData={novelData}
              imageURL={novelData.imageURL}
              genresArray={novelData.genres}
              shareNovel={shareNovel}
              chapterList={isConnected ? chapterList : downloadedChapters}
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