import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';

import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeContext } from '@/contexts/ThemeContext';
import  { popularNovels, searchNovels, fetchSingleNovel } from '@/sources/allnovelfull';
import { insertLibraryNovel, getNovelsBySource } from '@/database/ExpoDB';

import SearchBar from '@/components/SearchBar';

interface queriedData{
  id: number;
  title: string;
}

const SourceList = () => {
  const sourceData = useLocalSearchParams();
  const { appliedTheme } = useThemeContext();
  const [novels, setNovels] = useState([]);
  const [queriedNovels, setQueriedNovels] = useState<queriedData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
  const router = useRouter(); // Import and use router

  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const data = await getNovelsBySource(sourceData.sourceName);
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
    setLoading(true);
    const fetchFunction = searchQuery ? searchNovels : popularNovels;
    try {
      const novelsData = await fetchFunction(searchQuery || pageNumber, pageNumber); // Pass page number for both cases
      if (searchQuery) {
        
        if (pageNumber === 1) {
          setNovels(novelsData);
        } else {
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
        }
      } else {

        if (pageNumber === 1) {
          setNovels(novelsData);
          // console.log(JSON.stringify(novelsData, null, 2));
        } else {
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
        }
        // console.log(JSON.stringify(novelsData, null , 2));
      }
      setHasMore(novelsData.length === 20); 
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveNovel = async (novel) => {
    try {
      const result = await insertLibraryNovel(novel.title, novel.author, novel.chapterCount, novel.imageURL, novel.novelPageURL, sourceData.sourceName);
      setQueriedNovels(prevQueriedNovels => [...prevQueriedNovels, { id: result, title: novel.title }]); // Add the saved novel to queriedNovels
    } catch (error) {
      console.error('Error saving novel:', error);
    }
  };
  
  useEffect(() => {
    if (searchQuery) {
      fetchNovels(searchPage, searchQuery); // Fetch search results with searchPage
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
        setSearchPage(prevPage => prevPage + 1); // Load more search results
      } else {
        setPage(prevPage => prevPage + 1); // Load more popular novels
      }
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const novelWidth = screenWidth / 2 - 24;

  const handleNavigateToNovel = async (novelPageURL: string) => {
    try {
      const novelData = await fetchSingleNovel(novelPageURL);
      // console.log(JSON.stringify(novelData, null, 2) + ' inside of [id].tsx/source');
      router.navigate({ 
        pathname: `novel/[id]`, 
        params: {
          ...novelData,
          chapters: JSON.stringify(novelData.chapters),
        },
      });
      // params: { title: novelData.title, description: novelData.description, author: novelData.author, genres: novelData.genres, imageURL: novelData.imageURL, url: novelData.url, chapters: novelData.chapters } 
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isQueriedNovel = queriedNovels.some(queriedNovel => queriedNovel.title === item.title);
    // const foundQueriedNovel = queriedNovels.find(queriedNovel => queriedNovel.title === item.title);
    return (
      <TouchableOpacity 
        style={[styles.novelItem, { width: novelWidth }]} 
        onPress={() => handleNavigateToNovel(item.novelPageURL)} 
        onLongPress={() => handleSaveNovel(item)}
      >
        <Image 
          source={{ uri: item.imageURL }} 
          style={[styles.novelLogo, { height: 250, opacity: isQueriedNovel ? 0.3 : 1 }]} 
          resizeMode="contain"
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
        ListFooterComponent={loading ? 
          <Skeleton/>
          : null}
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
