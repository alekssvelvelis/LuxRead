import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeContext } from "@/contexts/ThemeContext";
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
const NovelSkeleton = () => {
    const { appliedTheme } = useThemeContext();
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

    return(
        <View style={{minWidth: '100%', minHeight: '100%', marginTop: 56, backgroundColor: appliedTheme.colors.elevation.level2}}>
            <Stack.Screen
                options={{
                headerTitle: `Loading`,
                headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
                headerTintColor: appliedTheme.colors.text,
                headerShown: false,
                }}
            />
            <View style={{ flexDirection: 'row' }}>
            <View style={styles.imageContainer}>
                  <ShimmerPlaceholder style={[styles.image]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
                <View style={[styles.textContainer, { marginVertical: 24, }]}>
                  <ShimmerPlaceholder style={[styles.title, styles.moveRight, { color: appliedTheme.colors.text, height: 40 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                  <View style={{ flexDirection: 'row', marginTop: 12 }}>
                      <ShimmerPlaceholder style={[styles.moveRight, { width: '10%', marginTop: 12 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                      <ShimmerPlaceholder style={[styles.moveRight, { width: '82.5%', marginTop: 12, marginLeft: 0 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <ShimmerPlaceholder style={[styles.moveRight, { width: '10%', marginTop: 12 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                    <ShimmerPlaceholder style={[styles.moveRight, { width: '82.5%', marginTop: 12, marginLeft: 0 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <ShimmerPlaceholder style={[styles.moveRight, { width: '10%', marginTop: 12 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                    <ShimmerPlaceholder style={[styles.moveRight, { width: '82.5%', marginTop: 12, marginLeft: 0 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                  </View>
                </View>
            </View>
            <View style={[styles.genreContainer, {}]}>
              <ShimmerPlaceholder style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
              <ShimmerPlaceholder style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
              <ShimmerPlaceholder style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
              <ShimmerPlaceholder style={[styles.genrePill, { backgroundColor: appliedTheme.colors.elevation.level2 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <View style={styles.descriptionContainer}>
                <ShimmerPlaceholder style={[styles.description, {} ]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[styles.description, {} ]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[styles.description, {} ]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[styles.description, {} ]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder  style={styles.toggleButton} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <ShimmerPlaceholder style={[styles.readingButton, {}]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <View style={{ flexDirection: 'row'}}>
                <View style={[styles.chapterContainer, {marginTop: 24}]}>
                <ShimmerPlaceholder style={[ { width: '80%', height: 24, marginLeft: 8 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: 24, marginRight: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
            </View>
            <View style={{ flexDirection: 'row'}}>
                <View style={[styles.chapterContainer, {marginTop: 24}]}>
                <ShimmerPlaceholder style={[ { width: '80%', height: 24, marginLeft: 8 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: 24, marginRight: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
            </View>
            <View style={{ flexDirection: 'row'}}>
                <View style={[styles.chapterContainer, {marginTop: 24}]}>
                <ShimmerPlaceholder style={[ { width: '80%', height: 24, marginLeft: 8 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: 24, marginRight: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
            </View>
            <View style={{ flexDirection: 'row'}}>
                <View style={[styles.chapterContainer, {marginTop: 24}]}>
                <ShimmerPlaceholder style={[ { width: '80%', height: 24, marginLeft: 8 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: 24, marginRight: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
            </View>
            <View style={{ flexDirection: 'row'}}>
                <View style={[styles.chapterContainer, {marginTop: 24}]}>
                <ShimmerPlaceholder style={[ { width: '80%', height: 24, marginLeft: 8 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: 24, marginRight: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
            </View>
            <View style={{ flexDirection: 'row'}}>
                <View style={[styles.chapterContainer, {marginTop: 24}]}>
                <ShimmerPlaceholder style={[ { width: '80%', height: 24, marginLeft: 8 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: 24, marginRight: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                </View>
            </View>
        </View>
    );
};

export default NovelSkeleton;

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
      width: 100,
      height: 175,
      marginVertical: 12,
    },
    title: {
      width: '95%',
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
      marginLeft: 5,
    },
    genrePill: {
      borderRadius: 15,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
      height: 32,
      width: 96,
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
        marginVertical: 4,
        width: '100%'
    },
    toggleButton: {
      marginLeft: '40%',
      marginTop: 8,
      width: 60,
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
    chapterContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
});