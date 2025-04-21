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
  
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: finalValue,
        duration: animationDuration,
        useNativeDriver: false, // Height animations can't use native driver
      }),
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  
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
    <Animated.View style={{width: '100%', height: animatedHeight, marginBottom: 52}}>
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', backgroundColor: 'red', width: '100%' }}>
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

// import React, { useRef, useState, useCallback, useEffect } from 'react';
// import { View, Text, Animated, TouchableWithoutFeedback, LayoutChangeEvent } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useThemeContext } from '@/contexts/ThemeContext';

// const COLLAPSED_LINES = 3;
// const ANIMATION_DURATION = 300;

// export default function ExpandableDescription({ description }: { description: string }) {
//   const { appliedTheme } = useThemeContext();
//   const [expanded, setExpanded] = useState(false);
//   const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
//   const [fullHeight, setFullHeight] = useState<number | null>(null);

//   // Animated value controlling container height
//   const animatedHeight = useRef(new Animated.Value(0)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;

//   // Once collapsedHeight is measured, initialize animation height
//   useEffect(() => {
//     if (collapsedHeight != null) {
//       animatedHeight.setValue(collapsedHeight);
//     }
//   }, [collapsedHeight, animatedHeight]);

//   // Run animations when `expanded` flips
//   useEffect(() => {
//     // Only animate if heights are known
//     if (collapsedHeight == null || fullHeight == null) return;

//     Animated.parallel([
//       Animated.timing(animatedHeight, {
//         toValue: expanded ? fullHeight : collapsedHeight,
//         duration: ANIMATION_DURATION,
//         useNativeDriver: false,
//       }),
//       Animated.timing(rotateAnim, {
//         toValue: expanded ? 1 : 0,
//         duration: ANIMATION_DURATION,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, [expanded, collapsedHeight, fullHeight, animatedHeight, rotateAnim]);

//   // Layout callbacks (only called once per measurement)
//   const onCollapsedLayout = useCallback((e: LayoutChangeEvent) => {
//     if (collapsedHeight != null) return;
//     const { height } = e.nativeEvent.layout;
//     setCollapsedHeight(height);
//     // initialize visible height to collapsed
//     animatedHeight.setValue(height);
//   }, [collapsedHeight, animatedHeight]);

//   const onFullLayout = useCallback((e: LayoutChangeEvent) => {
//     if (fullHeight != null) return;
//     const { height } = e.nativeEvent.layout;
//     setFullHeight(height);
//   }, [fullHeight]);

//   // Arrow rotation interpolation
//   const arrowRotation = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '180deg'],
//   });

//   return (
//     <View style={{ width: '100%' }}>
//       {/* Hidden measurer: renders both collapsed and full texts off-screen */}
//       <View style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
//         <Text numberOfLines={COLLAPSED_LINES} onLayout={onCollapsedLayout}>
//           {description}
//         </Text>
//         <Text onLayout={onFullLayout}>
//           {description}
//         </Text>
//       </View>

//       {/* Animated visible container */}
//       <Animated.View
//         style={{
//           height: animatedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         <Text style={{ color: appliedTheme.colors.text }}>
//           {description}
//         </Text>
//       </Animated.View>

//       {/* Toggle button only when text is actually collapsible */}
//       {collapsedHeight != null && fullHeight != null && fullHeight > collapsedHeight && (
//         <TouchableWithoutFeedback onPress={() => setExpanded(prev => !prev)}>
//           <Animated.View style={{ alignSelf: 'center', transform: [{ rotate: arrowRotation }], marginVertical: 12 }}>
//             <Ionicons name="chevron-down" size={32} color={appliedTheme.colors.primary} />
//           </Animated.View>
//         </TouchableWithoutFeedback>
//       )}
//     </View>
//   );
// }
