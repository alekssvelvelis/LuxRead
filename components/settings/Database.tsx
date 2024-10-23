import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Modal, Animated, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button, RadioButton, Text as PaperText } from 'react-native-paper';
import { clearTable } from '@/database/ExpoDB';
const Database = () => {
    const screenWidth = Dimensions.get('screen').width;
    const { appliedTheme } = useThemeContext();
    const [visible, setVisible] = useState<boolean>(false);
    const [fadeAnimation] = useState(new Animated.Value(0));

    const openModal = () => {
        setVisible(true);
        Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(fadeAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const handleClearDownloadedChapters = async () => {
        try {
            const isDeleted = await clearTable('downloadedChapters');
        } catch (error) {
            console.error('Error deleting downloaded chapters', error);
        } finally {
            setVisible(false);
        }
    }

    return (
        <View style={[styles.container, { width: screenWidth - 20 }]}>
            <Pressable
                onPress={openModal}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Database</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Clear entire database</Text>
            </Pressable>
            <Pressable
                onPress={openModal}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Downloaded chapters</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Clear downloaded chapters table</Text>
            </Pressable>
        </View>
    );
};

export default Database;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 18,
        paddingLeft: 8,
        marginBottom: 10,
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        position: 'absolute',
        top: '80%',
        left: '10%',
        width: '80%',
        transform: [{ translateY: -Dimensions.get('screen').height / 2 }],
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
    },
    radioButtonText: {
        marginLeft: 8,
    },
    pressable: {
        alignItems: 'flex-start',
        padding: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    currentValue: {
        fontSize: 14,
    },
});
