import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Modal, Animated, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button, RadioButton, Text as PaperText } from 'react-native-paper';
import { saveNovelRows, getNovelRows } from '@/utils/asyncStorage';

const DisplaySetting = ({ onNovelRowsChange }: { onNovelRowsChange: (rows: string) => void }) => {
    const screenWidth = Dimensions.get('screen').width;
    const { appliedTheme } = useThemeContext();
    const [visible, setVisible] = useState<boolean>(false);
    const [fadeAnimation] = useState(new Animated.Value(0));
    const [value, setValue] = useState<string>('1');

    useEffect(() => {
        const loadInitialValue = async () => {
            try {
                const savedValue = await getNovelRows();
                if (savedValue) {
                    setValue(savedValue);
                }
            } catch (error) {
                console.error('Failed to load the novel rows from storage:', error);
            }
        };

        loadInitialValue();
    }, []);

    useEffect(() => {
        saveNovelRows(value);
    }, [value]);

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

    return (
        <View style={[styles.container, { width: screenWidth - 20 }]}>
            <Text style={[styles.header, { color: appliedTheme.colors.text }]}>Library screen</Text>
            <Pressable
                onPress={openModal}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Novels per row</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Currently displaying: {value}</Text>
            </Pressable>
            {visible && (
                <Modal
                    transparent={true}
                    animationType="none"
                    visible={visible}
                    onRequestClose={closeModal}
                >
                    <Pressable style={styles.overlay} onPress={closeModal}>
                        <Animated.View style={[styles.overlay, { opacity: fadeAnimation }]} />
                    </Pressable>
                    <View style={[styles.modalContent, { backgroundColor: appliedTheme.colors.surfaceVariant }]}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ color: appliedTheme.colors.primary, justifyContent: 'flex-start', fontSize: 24 }}>Grid layout</Text>
                            <Text style={{ color: appliedTheme.colors.text, justifyContent: 'flex-start' }}>Novels per row: {value}</Text>
                        </View>
                        
                        <View style={{ width: '100%' }}>
                            <RadioButton.Group onValueChange={newValue => setValue(newValue)} value={value}>
                                <Pressable onPress={() => {setValue('1'), onNovelRowsChange('1')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                    <View style={styles.radioButtonContainer}>
                                        <RadioButton.Android value="1"  uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                        <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Extra large</PaperText>
                                    </View>
                                </Pressable>
                                <Pressable onPress={() => {setValue('2'), onNovelRowsChange('2')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                    <View style={styles.radioButtonContainer}>
                                        <RadioButton.Android value="2" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                        <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Large</PaperText>
                                    </View>
                                </Pressable>
                                <Pressable onPress={() => {setValue('3'), onNovelRowsChange('3')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                    <View style={styles.radioButtonContainer}>
                                        <RadioButton.Android value="3" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                        <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Medium</PaperText>
                                    </View>
                                </Pressable>
                                <Pressable onPress={() => {setValue('4'), onNovelRowsChange('4')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                    <View style={styles.radioButtonContainer}>
                                        <RadioButton.Android value="4" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                        <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Small</PaperText>
                                    </View>
                                </Pressable>
                            </RadioButton.Group>
                            <Button onPress={closeModal} textColor={appliedTheme.colors.text}>Close</Button>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default DisplaySetting;

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
