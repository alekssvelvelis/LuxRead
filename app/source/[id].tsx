import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';

import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeContext } from '@/contexts/ThemeContext';
import  { popularNovels, searchNovels, fetchSingleNovel } from '@/sources/allnovelfull';
import { insertLibraryNovel } from '@/database/ExpoDB';
import SearchBar from '@/components/SearchBar';

const SourceList = () => {
  const { appliedTheme } = useThemeContext();
  const [novels, setNovels] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
  const router = useRouter(); // Import and use router

  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1); // Track search page

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
    setSearchPage(1); // Reset search page when a new search starts
  };

  const fetchNovels = useCallback(async (pageNumber = 1, searchQuery = null) => {
    setLoading(true);
    // await new Promise(resolve => setTimeout(resolve, 20000)); //skeleton testing hehe

    const fetchFunction = searchQuery ? searchNovels : popularNovels;
    try {
      const novelsData = await fetchFunction(searchQuery || pageNumber, pageNumber); // Pass page number for both cases
      if (searchQuery) {
        
        if (pageNumber === 1) {
          // On a new search, replace existing novels
          setNovels(novelsData);
        } else {
          // Append search results if it's a subsequent page
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
        }
      } else {

        if (pageNumber === 1) {
          // For popular novels, replace existing on first page load
          setNovels(novelsData);
          // console.log(JSON.stringify(novelsData, null, 2));

        } else {
          // Append popular novels for more pages
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
        }
      }
      setHasMore(novelsData.length === 20); 
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use effect to trigger fetch based on page or search query
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

  const handleNavigateToNovel = async (novelPageURL) => {
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
    return (
      <TouchableOpacity style={[styles.novelItem, { width: novelWidth }]} onPress={() => handleNavigateToNovel(item.novelPageURL)} onLongPress={() => insertLibraryNovel(item.title, item.author, item.chapterCount, item.imageURL, item.novelPageURL)}>
        <Image 
          source={{ uri: item.imageURL }} 
          style={[styles.novelLogo, { height: 250 }]} 
          resizeMode="contain"
        />
        <Text numberOfLines={2} style={{ color: appliedTheme.colors.text, fontSize: 12 }}>
          {item.title}
        </Text>
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
  },
  novelLogo: {
    width: '100%',
    borderRadius: 4,
    objectFit: 'fill',
  },
});
