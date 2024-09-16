import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { PullUpModal } from '@/components/PullUpModal';
import { fetchChapters } from '@/sources/allnovelfull'; // Ensure fetchChapters is imported

const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const [chapterList, setChapterList] = useState([]); // Holds the loaded chapters
  const [loading, setLoading] = useState(false); // Loading state
  const [page, setPage] = useState(1); // Page for chapter pagination
  const [hasMoreChapters, setHasMoreChapters] = useState(true); // Track if more chapters exist

  const toggleRotation = () => {
    Animated.timing(rotation, {
      toValue: isRotated ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsRotated(!isRotated);
    setIsModalVisible(!isModalVisible);
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  const novelData = useLocalSearchParams();
  const genresArray = novelData.genres.split(',').map(genre => genre.trim());

  const [showFullDescription, setShowFullDescription] = useState(false);
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const loadChapters = async () => {
    if (!hasMoreChapters || loading) return;
    setLoading(true);

    try {
      const newChapters = await fetchChapters(novelData.url, page); // Fetch chapters for the current page
      if (newChapters.length > 0) {
        setChapterList(prevChapters => [...prevChapters, ...newChapters]); // Append new chapters
        setPage(prevPage => prevPage + 1); // Increment page
      } else {
        setHasMoreChapters(false); // No more chapters to load
      }
    } catch (error) {
      console.error("Error loading chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapters(); // Load the initial chapters
  }, []);
  useEffect(() => {
    console.log(chapterList.length); // Load the initial chapters
  }, [chapterList]);

  const renderChapterItem = ({ item, index }) => (
    <TouchableOpacity key={index} style={[styles.chapterContainer, { marginLeft: 8, paddingVertical: 12 }]}>
      <Text style={{ fontSize: 16, color: appliedTheme.colors.text, maxWidth: '90%', }} numberOfLines={1} ellipsizeMode='tail'>
        {item.title}
      </Text>
      <MaterialIcons size={36} name="download" color={appliedTheme.colors.text} style={{ zIndex: 3 }} />
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, {backgroundColor: appliedTheme.colors.background}]}>
      <Stack.Screen
        options={{
          headerTitle: `${novelData.title}`,
          headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
          headerTintColor: appliedTheme.colors.text,
        }}
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.textContainer, { marginVertical: 24 }]}>
          <Text style={[styles.title, styles.moveRight, { color: appliedTheme.colors.text }]}>{novelData.title}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons size={20} name="person-outline" style={styles.moveRight} color={appliedTheme.colors.text} />
            <Text style={[styles.chapters, { color: appliedTheme.colors.text }]}>{novelData.author}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScrollView}>
            <View style={styles.genreContainer}>
              {genresArray.map((genre, index) => (
                <View key={index} style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
                  <Text style={[styles.genreText, { color: appliedTheme.colors.text }]}>{genre}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: novelData.imageURL }} style={[styles.image]} />
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
        <View style={[styles.readingButton, { backgroundColor: appliedTheme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text }]} numberOfLines={1} ellipsizeMode='tail'>
            Start reading {chapterList[0].title}
          </Text>
        </View>
      )}
      {/* FlatList wrapped in View */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={chapterList}
          renderItem={renderChapterItem}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          onEndReached={loadChapters}
          onEndReachedThreshold={0.05} // Fetch when 20% away from the end
          ListFooterComponent={loading ? <ActivityIndicator size="large" color={appliedTheme.colors.text} /> : null} // Show loading indicator when fetching
          scrollEnabled={false} // Disable internal scrolling
        />
      </View>

      <PullUpModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          toggleRotation();
        }}
      >
        <Text>abcdefg</Text>
      </PullUpModal>
    </ScrollView>
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
    resizeMode: 'contain',
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
  genreScrollView: {
    flexGrow: 0,
    marginTop: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  genrePill: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    width: '95%',
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
    justifyContent: 'space-between',
  },
  totalChapters: {
    fontSize: 24,
  },
});
