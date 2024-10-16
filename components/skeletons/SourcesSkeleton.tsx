import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from "@/contexts/ThemeContext";

import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
const SourcesSkeleton = () => {
    const { appliedTheme } = useThemeContext();
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

    const screenWidth = Dimensions.get('window').width;
    const novelWidth = screenWidth / 2 - 24;

    return(
        <View style={[styles.novelItem, { width: novelWidth }]}>
            <ShimmerPlaceholder
            shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]} //maybe use #5c5b5b for shimmer, replace elevation.level1
            style={[styles.novelLogo, { height: 250 }]}
            >
            </ShimmerPlaceholder>
            <ShimmerPlaceholder
            shimmerColors={[appliedTheme.colors.elevation.level3, appliedTheme.colors.elevation.level1, appliedTheme.colors.elevation.level3]} //read 6 lines up
            style={[styles.novelLogo, { height: 24, marginTop: 6 }]}
            >
            </ShimmerPlaceholder>
        </View>
    );
};

export default SourcesSkeleton;

const styles = StyleSheet.create({
    novelItem: {
        marginBottom: 24,
        marginLeft: 8,
        position: 'relative',
      },
      novelLogo: {
        width: '100%',
        borderRadius: 4,
        objectFit: 'fill',
      },
});