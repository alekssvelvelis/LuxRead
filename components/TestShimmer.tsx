import React from 'react';
import { View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/contexts/ThemeContext';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonPlaceholder = () => {
  const { appliedTheme } = useThemeContext();

  return(
  <View>
    <ShimmerPlaceholder
      shimmerColors={[appliedTheme.colors.elevation.level3, 'red', appliedTheme.colors.elevation.level3]}
      style={{ height: 100, width: 100, backgroundColor: 'red',overflow: 'hidden',}} // Adjust size as needed
    >
      {/* Your skeleton content here */}
    </ShimmerPlaceholder>
  </View>
  );
};

export default SkeletonPlaceholder;
