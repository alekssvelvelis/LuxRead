import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack } from 'expo-router';
import { popularNovels, searchNovels } from '@/sources/allnovelfull';
import SearchBar from '@/components/SearchBar';

const SourceList = () => {
  const { appliedTheme } = useThemeContext();
  const source = useLocalSearchParams();
  
  // State to store novels
  const [novels, setNovels] = useState([]);
  const [originalNovels, setOriginalNovels] = useState([]); // Store pre-search novels
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
  };

  // Fetch novels based on the current page and search query
  const fetchNovels = useCallback(async (pageNumber, searchQuery) => {
    setLoading(true);
    const fetchFunction = searchQuery ? searchNovels : popularNovels;
    
    try {
      const novelsData = await fetchFunction(searchQuery || pageNumber);

      if (searchQuery) {
        // When searching, we do not want to append but replace with search results
        setNovels(novelsData);
      } else {
        if (novelsData.length > 0) {
          setNovels(prevNovels => [...prevNovels, ...novelsData]);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      }

    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handle search query change
    if (searchQuery) {
      // Save the current novels before the search, if it's not already saved
      if (originalNovels.length === 0) {
        setOriginalNovels(novels);  // Memorize the current set of novels
      }

      // Fetch novels based on the search query
      fetchNovels(1, searchQuery);
    } else {
      // If search query is cleared, restore the original novels
      setNovels(originalNovels);
      setOriginalNovels([]);  // Clear the memorized novels after restoring them
    }
  }, [searchQuery, fetchNovels]);

  // Fetch more novels when page changes
  useEffect(() => {
    if (!searchQuery) {
      fetchNovels(page, '');  // Fetch only if not searching
    }
  }, [page, fetchNovels]);

  const handleLoadMore = () => {
    if (!loading && hasMore && !searchQuery) {
      setPage(prevPage => prevPage + 1); // Load more novels only in the non-search case
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.novelItem, { width: novelWidth }]}>
      <Image 
        source={{ uri: item.imageURL }} 
        style={[styles.novelLogo, { height: 250 }]} 
        resizeMode="contain"
      />
      <Text numberOfLines={2} style={{ color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12 }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const screenWidth = Dimensions.get('window').width;
  const novelWidth = screenWidth / 2 - 24;

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
        ListFooterComponent={loading ? <Text style={{color: appliedTheme.colors.text}}>Loading more...</Text> : null}
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
