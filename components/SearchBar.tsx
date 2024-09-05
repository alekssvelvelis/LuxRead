import React, { useState, useRef } from 'react';
import { View, Pressable, TextInput, StyleSheet, Text, Animated } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { PullUpModal } from './PullUpModal'; // Adjust the import path as necessary

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { appliedTheme } = useThemeContext();
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const toggleRotation = () => {
    Animated.timing(rotation, {
      toValue: isRotated ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsRotated(!isRotated);
    setIsModalVisible(!isModalVisible); // Toggle modal visibility
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  return (
    <View style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: 28 }}>
      <View style={[styles.searchbarContainer, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
        <Pressable style={styles.searchbar} onPress={toggleRotation}>
          <Text>
            <Entypo name="magnifying-glass" size={26} color={appliedTheme.colors.onSurfaceVariant} />
          </Text>
          <TextInput
            placeholder='Search'
            placeholderTextColor={appliedTheme.colors.text}
            style={[styles.textInput, { color: appliedTheme.colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch}>
              <Ionicons name="close-outline" size={32} color={appliedTheme.colors.onSurfaceVariant} style={styles.icon} />
            </Pressable>
          )}
          <Animated.View style={[animatedStyle, styles.icon]}>
            <Ionicons name="triangle-outline" size={26} color={appliedTheme.colors.onSurfaceVariant} />
          </Animated.View>
        </Pressable>
      </View>
      <PullUpModal 
        visible={isModalVisible} 
        onClose={() => {
          setIsModalVisible(false);
          toggleRotation();
        }} 
        
      >
        <Text>test</Text>
        </PullUpModal>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchbarContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    minHeight: 52,
    borderRadius: 50,
    overflow: 'hidden',
    zIndex: 1,
    width: '90%',
  },
  searchbar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 8,
  },
  icon: {
    marginHorizontal: 8,
  },
  searchIconContainer: {
    borderRadius: 50,
    overflow: 'hidden',
  },
});
