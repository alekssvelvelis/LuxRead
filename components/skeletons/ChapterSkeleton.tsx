import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeContext } from "@/contexts/ThemeContext";
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
const ChapterSkeleton = () => {
    const { appliedTheme } = useThemeContext();
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

    return(
        <View style={[styles.container, ]}>
            <Stack.Screen
                options={{
                headerTitle: `Loading`,
                headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
                headerTintColor: appliedTheme.colors.text,
                headerShown: false,
                }}
            />
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <ShimmerPlaceholder style={[ { width: '80%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <View style={{ flexDirection: 'row', marginTop: 18,}}>
                <ShimmerPlaceholder style={[ { width: '60%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: '25%', marginLeft: 12, marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <View style={{marginTop: 18}}>
                <ShimmerPlaceholder style={[ { width: '100%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: '40%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 18, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <ShimmerPlaceholder style={[ { width: '80%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <View style={{ flexDirection: 'row', marginTop: 18,}}>
                <ShimmerPlaceholder style={[ { width: '60%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: '25%', marginLeft: 12, marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <View style={{marginTop: 18}}>
                <ShimmerPlaceholder style={[ { width: '100%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: '40%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 18, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <ShimmerPlaceholder style={[ { width: '80%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            <View style={{ flexDirection: 'row', marginTop: 18,}}>
                <ShimmerPlaceholder style={[ { width: '60%', marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
                <ShimmerPlaceholder style={[ { width: '25%', marginLeft: 12, marginTop: 12, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
            </View>
            <ShimmerPlaceholder style={[ { width: '100%', marginTop: 18, height: 24 }]} shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]}></ShimmerPlaceholder>
        </View>
    );
};

export default ChapterSkeleton;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 28,
      },
});