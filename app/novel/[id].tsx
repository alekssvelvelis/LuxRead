import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { PullUpModal } from '@/components/PullUpModal';
const Synopsis = () => {
  const { appliedTheme } = useThemeContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;
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

  const novel = useLocalSearchParams();
  const imageUrl = typeof novel.imageUrl === 'string' ? novel.imageUrl : '';
  const genresArray = novel.genres.split(',').map(genre => genre.trim());

  const [showFullDescription, setShowFullDescription] = useState(false);
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderChapters = (numberOfChapters) => {
    const chapters = [];
    for (let i = 1; i <= numberOfChapters; i++) {
      chapters.push(
        <TouchableOpacity key={i} style={[styles.chapterContainer, { marginLeft: 8, paddingVertical: 12 }]}>
          <Text style={{ fontSize: 16, color: appliedTheme.colors.text }}>
            {`Chapter ${i}: Prologue`}
          </Text>
          <MaterialIcons size={36} name="download" color={appliedTheme.colors.text} style={{zIndex: 3}} />
        </TouchableOpacity>
      );
    }
    return chapters;
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <Stack.Screen 
        options={{
          headerTitle: `${novel.title}`,
          headerStyle:  {backgroundColor: appliedTheme.colors.elevation.level2},
          headerTintColor: appliedTheme.colors.text,
        }}
      />
      <View style={{ flexDirection: 'row',}}>
        <View style={[styles.textContainer, { marginVertical: 24 }]}>
          <Text style={[styles.title, styles.moveRight, { color: appliedTheme.colors.text }]}>{novel.title}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons size={20} name="person-outline" style={styles.moveRight} color={appliedTheme.colors.text} />
            <Text style={[styles.chapters, { color: appliedTheme.colors.text }]}>{novel.author}</Text>  
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.genreScrollView}
          >
            <View style={styles.genreContainer}>
              {genresArray.map((genre, index) => (
                <View key={index} style={[styles.genrePill, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
                  <Text style={[styles.genreText, { color: appliedTheme.colors.text }]}>{genre}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={[styles.image]} />
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <Text 
          style={[styles.description, { color: appliedTheme.colors.text }]} 
          numberOfLines={showFullDescription ? undefined : 3}
        >
          {novel.description}
        </Text>
        <TouchableOpacity onPress={toggleDescription} style={styles.toggleButton}>
          <Text style={[styles.toggleButtonText, { color: appliedTheme.colors.primary }]}>
            {showFullDescription ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.readingButton, { backgroundColor: appliedTheme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.readingButtonText, { color: appliedTheme.colors.text }]} numberOfLines={1} ellipsizeMode='tail'>
          Start reading Chapter 1: Prologue
        </Text>
      </View>
      <View style={{ flexDirection: 'row'}}>
        <View style={[styles.chapterContainer, {}]}>
          <Text style={[styles.totalChapters, styles.moveRight, { color: appliedTheme.colors.text }]}>Chapters: 30</Text>
          <TouchableOpacity onPress={toggleRotation}>
            <Animated.View style={[animatedStyle]}>
              <MaterialIcons size={36} name="keyboard-double-arrow-down" color={appliedTheme.colors.text}/> 
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12}}>
        <View style={[styles.chapterContainer, { flexDirection: 'column' }]}>
          
          {renderChapters(30)}
          
        </View>
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
    flexDirection:'row',
    justifyContent: 'space-between'
  },
  totalChapters: {
    fontSize: 24
  }
});
