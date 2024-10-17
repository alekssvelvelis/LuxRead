import React, { useState, useRef } from 'react';
import { View, Pressable, TextInput, StyleSheet, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { PullUpModal } from './PullUpModal'; // Adjust the import path as necessary
import { usePathname } from 'expo-router';
import useNavigateBack from '@/hooks/useNavigateBack';
interface SearchBarProps {
  onSearchChange: (query: string) => void; // onSearchChange takes a string and returns nothing (void)
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { appliedTheme } = useThemeContext();
  const [isRotated, setIsRotated] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const pathname = usePathname();
  const isCoreTab = pathname === '/library' || pathname === '/sources';
  const navigateBack = useNavigateBack();
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
    onSearchChange('');
  };

  const handleSearchSubmit = () => {
    onSearchChange(searchQuery);
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', marginTop: 28 }}>
      <View style={[styles.searchbarContainer, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
        <Pressable style={styles.searchbar}>
          <Ionicons 
            name={isCoreTab ? 'search-outline' : 'arrow-back'} 
            size={26} 
            color={appliedTheme.colors.onSurfaceVariant} 
            onPress={navigateBack} 
          />
          <TextInput
            placeholder='Search'
            placeholderTextColor={appliedTheme.colors.text}
            style={[styles.textInput, { color: appliedTheme.colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery} // Set query as user types
            onSubmitEditing={handleSearchSubmit}
            onBlur={handleSearchSubmit}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch}>
              <Ionicons name="close-outline" size={32} color={appliedTheme.colors.onSurfaceVariant} />
            </Pressable>
          )}
          <Animated.View style={[{ transform: [{ rotate: rotateInterpolate }] }, styles.icon]}>
            <Ionicons name="triangle-outline" size={26} color={appliedTheme.colors.onSurfaceVariant} onPress={toggleRotation} />
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
    width: '90%',
  },
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 8,
  },
  icon: {
    marginHorizontal: 8,
  },
});
