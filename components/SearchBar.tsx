import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, TextInput, StyleSheet, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { PullUpModal } from './PullUpModal'; // Adjust the import path as necessary
import { router, usePathname } from 'expo-router';

const SearchBar = ({ onSearchChange }) => {
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
    setIsModalVisible(!isModalVisible);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearchChange(''); // Clear the search query in the parent component as well
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };
  const pathname = usePathname();
  const isCoreTab = pathname === '/library' || pathname === '/sources';

  const handleBackPress = () => {
    if (!isCoreTab) {
      router.back(); // Navigate back to the previous page
    }
  };

  const handleChangeQuery = (query) => {
    setSearchQuery(query); // Update the search query state
    onSearchChange(query); // Call the callback function with the new search text
  };

  return (
    <View style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: 28 }}>
      <View style={[styles.searchbarContainer, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
        <Pressable style={styles.searchbar} onPress={toggleRotation}>
          <Text>
            <Ionicons name={isCoreTab ? 'search-outline' : 'chevron-back'} size={26} color={appliedTheme.colors.onSurfaceVariant} onPress={handleBackPress} />
          </Text>
          <TextInput
            placeholder='Search'
            placeholderTextColor={appliedTheme.colors.text}
            style={[styles.textInput, { color: appliedTheme.colors.text }]}
            value={searchQuery}
            onChangeText={handleChangeQuery}
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
    paddingHorizontal: 12,
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
