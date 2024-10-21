import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';

import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image'; //  takes priority over react-native image tag to read static images

import { useThemeContext } from '@/contexts/ThemeContext';
import { useNetwork } from '@/contexts/NetworkContext';
import getSourceFunctions from '@/utils/getSourceFunctions'; 
import { insertLibraryNovel, getNovelsBySource } from '@/database/ExpoDB';

import SearchBar from '@/components/SearchBar';
import SourcesSkeleton from '@/components/skeletons/SourcesSkeleton';
import NetInfoHelper from '@/components/NetInfoHelper';

const SourceList = () => {
  const { isConnected } = useNetwork();
  const { sourceName } = useLocalSearchParams();
  const sourceNameString = String(sourceName);
  const { appliedTheme } = useThemeContext();

  if(!isConnected){
    return(
      <View style={[styles.container, {backgroundColor: appliedTheme.colors.background}]}>
        <Stack.Screen 
          options={{
            headerShown: false,
          }}
        />
        <NetInfoHelper></NetInfoHelper>
      </View>
    );
  }

  const [novels, setNovels] = useState<object>([]);
  const [queriedNovels, setQueriedNovels] = useState<object>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchPage, setSearchPage] = useState<number>(1);

  const [fetchFunctions, setFetchFunctions] = useState<any>(null);
  useEffect(() => {
    if (sourceNameString) {
      try {
        const functions = getSourceFunctions(sourceNameString);
        setFetchFunctions(functions);
      } catch (error) {
        console.error('Error loading source functions:', error);
      }
    }
  }, [sourceName]);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const data = await getNovelsBySource(sourceNameString);
        setQueriedNovels(data);
      } catch (error) {
        console.error("Failed to fetch queried novels:", error);
      }
    };
    fetchNovels();
  }, []);

  const handleSearchQuery = (query: string) => {
    setSearchQuery(query);
    setSearchPage(1);
  };

  const fetchNovels = useCallback(async (pageNumber = 1, searchQuery = null) => {
    if (!fetchFunctions) {
      // console.log("fetchFunctions is not available");
      return;
    }
    setLoading(true);
    const fetchFunction = searchQuery ? fetchFunctions.searchNovels : fetchFunctions.popularNovels;
    try {
      const novelsData = await fetchFunction(searchQuery || pageNumber, pageNumber);
      // console.log(JSON.stringify(novelsData, null, 2));
      if (searchQuery) { 
        if (pageNumber === 1) {
          setNovels(novelsData);
        } else {
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
        }
      } else {
        if (pageNumber === 1) {
          setNovels(novelsData);
        } else {
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
        }
      }
      setHasMore(novelsData.length >= 15); 
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunctions]);

  

  const handleSaveNovel = async (novel) => {
    try {
      const allNovelInfo = await fetchFunctions.fetchSingleNovel(novel.novelPageURL);
      const chapterCount = parseInt(allNovelInfo.chapterCount);
      const genres = String(allNovelInfo.genres);
      console.log(allNovelInfo);
      const result = await insertLibraryNovel(allNovelInfo.title, allNovelInfo.author, allNovelInfo.description, genres, chapterCount, allNovelInfo.imageURL, allNovelInfo.novelPageURL, sourceName);
      setQueriedNovels(prevQueriedNovels => [...prevQueriedNovels, { id: result, title: allNovelInfo.title }]); // Add the saved novel to queriedNovels
    } catch (error) {
      console.error('Error saving novel:', error);
    }
  };
  
  useEffect(() => {
    if (searchQuery) {
      fetchNovels(searchPage, searchQuery);
      setLoading(true);
    } else {
      fetchNovels(page);
      setLoading(true);
    }
  }, [page, searchPage, searchQuery, fetchNovels]);

  useEffect(()=>{
    if(!searchQuery){
      setNovels([]);
      setPage(1);
    }
  }, [searchQuery])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      if (searchQuery) {
        setSearchPage(prevPage => prevPage + 1);
      } else {
        setPage(prevPage => prevPage + 1);
      }
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const novelWidth = screenWidth / 2 - 24;

  const handleNavigateToNovel = async (novelPageURL: string) => {
    try {
      const novelData = await fetchFunctions.fetchSingleNovel(novelPageURL);
      console.log(novelData);
      router.navigate({ 
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        pathname: `novel/[id]`, 
        params: {
          ...novelData,
          sourceName: sourceName,
        },
      }); 
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isQueriedNovel = queriedNovels.some(queriedNovel => queriedNovel.title === item.title);
    return (
      <TouchableOpacity 
        style={[styles.novelItem, { width: novelWidth }]} 
        onPress={() => handleNavigateToNovel(item.novelPageURL)} 
        onLongPress={() => handleSaveNovel(item)}
      >
        <Image 
          source={{ uri: item.imageURL }} 
          style={[styles.novelLogo, { minHeight: 250, opacity: isQueriedNovel ? 0.3 : 1 }]} 
          contentFit="fill"
        />
        <Text numberOfLines={2} style={{ color: appliedTheme.colors.text, fontSize: 12 }}>
          {item.title}
        </Text>
        <View style={[styles.isInLibraryPill,{backgroundColor: appliedTheme.colors.elevation.level2, display: isQueriedNovel ? 'flex' : 'none'}]}>
          <Text style={{ color: appliedTheme.colors.text, fontSize: 12 }}>In library</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.header}>
        <SearchBar onSearchChange={handleSearchQuery}/>
      </View>
      <FlatList
        data={novels}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.scrollViewContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ?  <SourcesSkeleton/> : null}
      />
    </View>
  );
};

export default SourceList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 100,
  },
  scrollViewContent: {
    padding: 12,
    paddingTop: 20,
  },
  novelItem: {
    marginBottom: 24,
    marginLeft: 8,
    position: 'relative',
  },
  novelLogo: {
    width: '100%',
    borderRadius: 4,
    objectFit: 'fill',
  },
  isInLibraryPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 4,
    padding: 4,
  }
});
