import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';

const ExpandableDescription = ({ description }: { description: string,}) => {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState<number>(0);
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animationDuration = 300;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { appliedTheme } = useThemeContext();
  const toggle = () => {
    const finalValue = expanded ? collapsedHeight : fullHeight;
    Animated.timing(animatedHeight, {
      toValue: finalValue,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const onFullTextLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setFullHeight(height);
    if (collapsedHeight !== null) {
      animatedHeight.setValue(collapsedHeight);
    }
  };

  const onCollapsedTextLayout = (event: LayoutChangeEvent) => {
    if (collapsedHeight === null) {
      const { height } = event.nativeEvent.layout;
      setCollapsedHeight(height);
      animatedHeight.setValue(height);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <Animated.View style={{ height: animatedHeight }}>
        <Text style={{ color: appliedTheme.colors.text }}>
          {description}
        </Text>
      </Animated.View>
      {fullHeight && collapsedHeight && fullHeight > collapsedHeight && (
        <TouchableOpacity onPress={toggle} activeOpacity={0.1}>
          <Animated.View style={{ transform: [{ rotate: arrowRotation }], alignSelf: 'center', marginTop: 8, marginBottom: 12 }}>
            <Ionicons size={32} name="chevron-down" color={appliedTheme.colors.primary} />
          </Animated.View>
        </TouchableOpacity>
      )}
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <Text onLayout={onFullTextLayout}>{description}</Text>
        <Text numberOfLines={3} onLayout={onCollapsedTextLayout}>{description}</Text>
      </View>
    </View>
  );
};

export default ExpandableDescription;
