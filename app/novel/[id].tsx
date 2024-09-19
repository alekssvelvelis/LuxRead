import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { PullUpModal } from '@/components/PullUpModal';
import { fetchChapters } from '@/sources/allnovelfull'; // Ensure fetchChapters is imported

interface Chapter {
  title: string;
}

const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const [chapterList, setChapterList] = useState<Chapter[]>([]); // Holds the loaded chapters
  const [loading, setLoading] = useState(false); // Loading state
  const [page, setPage] = useState(1); // Page for chapter pagination
  const [hasMoreChapters, setHasMoreChapters] = useState(true); // Track if more chapters exist

  const router = useRouter();

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
  const imageURL = Array.isArray(novelData.imageURL) ? novelData.imageURL[0] : novelData.imageURL;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleLoadMore = () => {
    if (!loading && hasMoreChapters) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const loadChapters = useCallback(async (pageNumber = 1) => {
    setLoading(true);

    try {
      const chapters = await fetchChapters(novelData.url, pageNumber);
      if (chapters) {
        setChapterList(chapterList => [...chapterList, ...chapters]);
      }
      if (chapters.length === 50) {
        setHasMoreChapters(true);
      } else {
        setHasMoreChapters(false);
      }
    } catch (error) {
      console.error('Error fetching more chapters', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapters(page); // Load the initial chapters
  }, [page]);

  const handleNavigateToChapter = async (chapterPageURL: string) => {
    try {
      router.navigate({ 
        pathname: `chapter/[id]`, 
        params: {
          chapterPageURL: chapterPageURL,
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  const renderChapterItem = ({ item }: { item: Chapter }) => (
    <TouchableOpacity key={item.title} style={[styles.chapterContainer, { paddingVertical: 12 }]} onPress={() => handleNavigateToChapter(item.url)}>
      <Text style={{ fontSize: 16, color: appliedTheme.colors.text, width: '90%' }} numberOfLines={1} ellipsizeMode='tail'>
        {item.title}
      </Text>
      <MaterialIcons size={36} name="download" color={appliedTheme.colors.text} style={{ zIndex: 3 }} />
    </TouchableOpacity>
  );
  const renderListHeader = () => (
    <View style={{minWidth: '100%'}}>
      <Stack.Screen
        options={{
          headerTitle: `${novelData.title}`,
          headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
          headerTintColor: appliedTheme.colors.text,
        }}
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.textContainer, { marginVertical: 24, }]}>
          <Text style={[styles.title, styles.moveRight, { color: appliedTheme.colors.text }]}>{novelData.title}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons size={20} name="person-outline" style={styles.moveRight} color={appliedTheme.colors.text} />
            <Text style={[styles.chapters, { color: appliedTheme.colors.text }]}>{novelData.author}</Text>
          </View>
          <FlatList
            data={genresArray}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.genreContainer, {width: '100%'} ]}
            renderItem={({ item }) => (
              <View style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
                <Text style={[styles.genreText, { color: appliedTheme.colors.text }]}>{item}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageURL }} style={[styles.image]} />
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
       <View style={{ flexDirection: 'row'}}>
        <View style={[styles.chapterContainer, {}]}>
          <Text style={[styles.totalChapters, { color: appliedTheme.colors.text }]}>Chapters: {novelData.chapterCount}</Text>
          <TouchableOpacity onPress={toggleRotation}>
            <Animated.View style={[animatedStyle]}>
              <MaterialIcons size={36} name="keyboard-double-arrow-down" color={appliedTheme.colors.text}/> 
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: appliedTheme.colors.background}]}>
      <FlatList
        data={chapterList}
        renderItem={renderChapterItem}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
          ) : !hasMoreChapters ? (
            <Text style={{ textAlign: 'center', color: appliedTheme.colors.text, marginTop: 24 }}>No more chapters</Text>
          ) : null
        }
        ListHeaderComponent={renderListHeader}
      />
      <PullUpModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          toggleRotation();
        }}
      >
        <Text>abcdefg</Text>
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
    justifyContent: 'space-between',
  },
  totalChapters: {
    fontSize: 24
  },
});
