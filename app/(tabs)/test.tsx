import React, { useState, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const test = () => {
    const ExpandableText = ({ text }) => {
        const [expanded, setExpanded] = useState(false);
        const [fullHeight, setFullHeight] = useState(null);
        const [collapsedHeight, setCollapsedHeight] = useState(null);
        const animatedHeight = useRef(new Animated.Value(0)).current;
        const animationDuration = 300;
        
        // Animated value for arrow rotation
        const rotateAnim = useRef(new Animated.Value(0)).current;
      
        // Toggle between expanded and collapsed states.
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
      
        // Interpolate the rotation from 0 to 180 degrees.
        const rotateInterpolate = rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        });
      
        // Handlers to measure the text heights.
        const onFullTextLayout = (event) => {
          if (fullHeight === null) {
            const { height } = event.nativeEvent.layout;
            setFullHeight(height);
            // If the collapsed height is already measured, set the initial animated height.
            if (collapsedHeight !== null) {
              animatedHeight.setValue(collapsedHeight);
            }
          }
        };
      
        const onCollapsedTextLayout = (event) => {
          if (collapsedHeight === null) {
            const { height } = event.nativeEvent.layout;
            setCollapsedHeight(height);
            animatedHeight.setValue(height);
          }
        };
      
        return (
          <View>
            {/* Animated container for the text */}
            <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
              <Text style={styles.text}>
                {text}
              </Text>
            </Animated.View>
      
            {/* Only show the arrow if the text is longer than three lines */}
            {(fullHeight && collapsedHeight && fullHeight > collapsedHeight) && (
              <TouchableOpacity onPress={toggle} style={styles.arrowContainer}>
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <Text style={styles.arrow}>▼</Text>
                </Animated.View>
              </TouchableOpacity>
            )}
      
            {/* Hidden views for measuring heights */}
            <View style={{ position: 'absolute', opacity: 0 }} pointerEvents="none">
              {/* Full text (no line limit) */}
              <Text style={styles.text} onLayout={onFullTextLayout}>
                {text}
              </Text>
              {/* Collapsed text (3 lines) */}
              <Text style={styles.text} numberOfLines={3} onLayout={onCollapsedTextLayout}>
                {text}
              </Text>
            </View>
          </View>
        );
      };

    const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    return (
        <View>
            <ExpandableText text={loremIpsumText} />
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        lineHeight: 22,
    },
    arrowContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    arrow: {
        fontSize: 18,
    },
});

export default test;