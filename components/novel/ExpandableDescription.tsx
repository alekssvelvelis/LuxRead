import React, { useRef, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
const ExpandableDescription = ({description}: {description: string}) => {
  const { appliedTheme } = useThemeContext();
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animationDuration = 300;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
    // Delay setting fullHeight to ensure the text is fully rendered
    setFullHeight(height);
    if (collapsedHeight !== null) {
      animatedHeight.setValue(collapsedHeight);
    }
    console.log(height, 'inside of full text layout');
  };

  const onCollapsedTextLayout = (event: LayoutChangeEvent) => {
    if (collapsedHeight === null) {
      const { height } = event.nativeEvent.layout;
      setCollapsedHeight(height);
      animatedHeight.setValue(height);
      console.log(height, 'inside of collapsed text layout');
    }
  };

  return (
    <Animated.View style={{width: '100%', height: animatedHeight, marginBottom: 52}}>
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '100%' }}>
        <Text onLayout={onFullTextLayout}>
          {description}
        </Text>
        <Text numberOfLines={3} onLayout={onCollapsedTextLayout}>
          {description}
        </Text>
      </View>
      <Text style={[ { color: appliedTheme.colors.text }]}>
        {description}
      </Text>
      {(fullHeight && collapsedHeight && fullHeight > collapsedHeight) && (
        <TouchableOpacity onPress={toggle} activeOpacity={0.1} style={{}}>
          <Animated.View style={{ transform: [{ rotate: arrowRotation }], alignSelf: 'center', marginTop: 8, marginBottom: 12}}>
            <Ionicons size={32} name="chevron-down" color={appliedTheme.colors.primary} />
          </Animated.View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default ExpandableDescription;