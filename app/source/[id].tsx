import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack } from 'expo-router';
import popularNovels from '@/sources/allnovelfull';

const SourceList = () => {
  const { appliedTheme } = useThemeContext();
  const source = useLocalSearchParams();
  
  const [novels, setNovels] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchNovels = useCallback(async (pageNumber) => {
    setLoading(true);
    const novelsData = await popularNovels(pageNumber);
    setLoading(false);

    if (novelsData.length > 0) {
      setNovels(prevNovels => [...prevNovels, ...novelsData]);
      setHasMore(novelsData.length > 0);
    } else {
      setHasMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNovels(page);
  }, [page, fetchNovels]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
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
          headerTitle: `${source.sourceName}`,
          headerStyle:  {backgroundColor: appliedTheme.colors.elevation.level2},
          headerTintColor: appliedTheme.colors.text,
        }}
      />
      <FlatList
        data={novels}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.scrollViewContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <Text>Loading more...</Text> : null}
      />
    </View>
  );
};

export default SourceList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 4,
    objectFit: 'cover',
  },
});
