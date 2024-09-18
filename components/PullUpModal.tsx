import React, { useState, useEffect } from 'react';
import {
    Modal,
    Dimensions,
    View,
    StyleSheet,
    Text,
    Animated,
    SafeAreaView,
    Pressable,
    TouchableWithoutFeedback,
} from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';

const { height } = Dimensions.get('window');

interface PullUpModalProps {
    visible: boolean;
    onClose: () => void;
    children?: React.ReactNode;

}

export function PullUpModal({ visible, onClose, children }: PullUpModalProps) {
    const { theme, appliedTheme } = useThemeContext();
    const [slideAnimation] = useState(new Animated.Value(height)); // Initial position off-screen
    const [fadeAnimation] = useState(new Animated.Value(0)); // Initial opacity
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            animateIn();
        } else {
            animateOut();
        }
    }, [visible]);

    const animateIn = () => {
        Animated.parallel([
            Animated.timing(slideAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const animateOut = () => {
        Animated.parallel([
            Animated.timing(slideAnimation, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => setIsVisible(false));
    };
    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} >
            <AnimatedPressable style={[styles.overlay, { opacity: fadeAnimation }]} onPress={onClose}>
                <View style={styles.overlayContent}>
                    <TouchableWithoutFeedback>
                        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnimation }], backgroundColor: appliedTheme.colors.surfaceVariant }]}>
                            <SafeAreaView style={styles.container}>
                                {children}
                            </SafeAreaView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </AnimatedPressable>
        </Modal>
    );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: '#000000AA',
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayContent: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        minHeight: height * 0.4,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        
    },
    text: {
        fontSize: 20,
    },
});
