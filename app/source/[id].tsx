import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';

import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'

import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image'; //  takes priority over react-native image tag to read static images

import { useThemeContext } from '@/contexts/ThemeContext';
import getSourceFunctions from '@/utils/getSourceFunctions'; 
import { insertLibraryNovel, getNovelsBySource } from '@/database/ExpoDB';

import SearchBar from '@/components/SearchBar';

interface queriedData{
  id: number;
  title: string;
}

const SourceList = () => {
  const { sourceName } = useLocalSearchParams();
  const { appliedTheme } = useThemeContext();

  const [novels, setNovels] = useState<object>([]);
  const [queriedNovels, setQueriedNovels] = useState<queriedData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
  const router = useRouter();

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchPage, setSearchPage] = useState<number>(1);

  const [fetchFunctions, setFetchFunctions] = useState<any>(null);
  useEffect(() => {
    if (sourceName) {
      try {
        const functions = getSourceFunctions(sourceName); // Use the utility function to get the source functions
        setFetchFunctions(functions);
      } catch (error) {
        console.error('Error loading source functions:', error);
      }
    }
  }, [sourceName]);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const data = await getNovelsBySource(sourceName);
        // console.log(JSON.stringify(data, null,2));
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
      console.log("fetchFunctions is not available");
      return;
    }
    setLoading(true);
    const fetchFunction = searchQuery ? fetchFunctions.searchNovels : fetchFunctions.popularNovels;
    try {
      const novelsData = await fetchFunction(searchQuery || pageNumber, pageNumber);
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
      const result = await insertLibraryNovel(novel.title, novel.author, novel.chapterCount, novel.imageURL, novel.novelPageURL, sourceName);
      setQueriedNovels(prevQueriedNovels => [...prevQueriedNovels, { id: result, title: novel.title }]); // Add the saved novel to queriedNovels
    } catch (error) {
      console.error('Error saving novel:', error);
    }
  };
  
  useEffect(() => {
    if (searchQuery) {
      fetchNovels(searchPage, searchQuery);
      setLoading(true); // Fetch search results with searchPage
    } else {
      fetchNovels(page); // Fetch popular novels with normal page
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
      router.navigate({ 
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
  
  const Skeleton = () => (
    <View style={[styles.novelItem, { width: novelWidth }]}>
    <ShimmerPlaceholder
      shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]} //maybe use #5c5b5b for shimmer, replace elevation.level1
      style={[styles.novelLogo, { height: 250 }]}
    >
    </ShimmerPlaceholder>
    <ShimmerPlaceholder
      shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]} //read 6 lines up
      style={[styles.novelLogo, { height: 24, marginTop: 6 }]}
    >
    </ShimmerPlaceholder>
  </View>
  );

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
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.scrollViewContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ?  <Skeleton/> : null}
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
