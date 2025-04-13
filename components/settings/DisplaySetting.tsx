import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button, RadioButton, Text as PaperText } from 'react-native-paper';
import { saveNovelRows, getNovelRows } from '@/utils/asyncStorage';
import ModalComponent from '../ModalComponent';

const DisplaySetting = ({ onNovelRowsChange }: { onNovelRowsChange: (rows: string) => void }) => {
    const screenWidth = Dimensions.get('screen').width;
    const { appliedTheme } = useThemeContext();
    const [novelRowsModalVisible, setNovelRowsModalVisible] = useState<boolean>(false);
    const [bookLayoutModalVisible, setBookLayoutModalVisible] = useState<boolean>(false);
    const [novelsRowValue, setNovelsRowValue] = useState<string>('1');
    const [bookLayoutValue, setBookLayoutValue] = useState<string>('Title in book cover');

    useEffect(() => {
        const loadInitialValue = async () => {
            try {
                const savedValue = await getNovelRows();
                if (savedValue) {
                    setNovelsRowValue(savedValue);
                }
            } catch (error) {
                console.error('Failed to load the novel rows from storage:', error);
            }
        };

        loadInitialValue();
    }, []);

    useEffect(() => {
        saveNovelRows(novelsRowValue);
    }, [novelsRowValue]);

    const openNovelRowsModal = () => {
        setNovelRowsModalVisible(true);
    };

    const closeNovelRowsModal = () => {
        setNovelRowsModalVisible(false);
    };

    const openBookLayoutModal = () => {
        setBookLayoutModalVisible(true);
    };

    const closeBookLayoutModal = () => {
        setBookLayoutModalVisible(false);
    };

    return (
        <View style={[styles.container, { width: screenWidth - 20 }]}>
            <Text style={[styles.header, { color: appliedTheme.colors.text }]}>Library screen</Text>
            <Pressable
                onPress={openNovelRowsModal}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Novels per row</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Currently displaying: {novelsRowValue}</Text>
            </Pressable>
            {novelRowsModalVisible && (
                <ModalComponent visible={novelRowsModalVisible} onClose={closeNovelRowsModal}>
                    <View style={{width: '100%', backgroundColor: appliedTheme.colors.surfaceVariant, padding: 12, borderRadius: 8}}>
                        <Text style={{ color: appliedTheme.colors.primary, justifyContent: 'flex-start', fontSize: 24 }}>Grid layout</Text>
                        <Text style={{ color: appliedTheme.colors.text, justifyContent: 'flex-start' }}>Novels per row: {novelsRowValue}</Text>
                        <RadioButton.Group onValueChange={newValue => setNovelsRowValue(newValue)} value={novelsRowValue}>
                            <Pressable onPress={() => {setNovelsRowValue('1'), onNovelRowsChange('1')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="1"  uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Extra large</PaperText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => {setNovelsRowValue('2'), onNovelRowsChange('2')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="2" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Large</PaperText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => {setNovelsRowValue('3'), onNovelRowsChange('3')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="3" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Medium</PaperText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => {setNovelsRowValue('4'), onNovelRowsChange('4')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="4" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Small</PaperText>
                                </View>
                            </Pressable>
                            <Button onPress={closeNovelRowsModal} textColor={appliedTheme.colors.text}>Close</Button>
                        </RadioButton.Group>
                    </View>
                </ModalComponent>
            )}
            <Pressable
                onPress={openBookLayoutModal}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Novel design layout</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Currently using: {bookLayoutValue}</Text>
            </Pressable>
            {bookLayoutModalVisible && (
                <ModalComponent visible={bookLayoutModalVisible} onClose={closeBookLayoutModal}>
                    <View style={{width: '100%', backgroundColor: appliedTheme.colors.surfaceVariant, padding: 12, borderRadius: 8}}>
                        <Text style={{ color: appliedTheme.colors.primary, justifyContent: 'flex-start', fontSize: 24 }}>Library novel layout</Text>
                        <Text style={{ color: appliedTheme.colors.text, justifyContent: 'flex-start' }}>Current novel layout: {bookLayoutValue}</Text>
                        <RadioButton.Group onValueChange={newValue => setNovelsRowValue(newValue)} value={bookLayoutValue}>
                            <Pressable onPress={() => {setNovelsRowValue('1'), onNovelRowsChange('1')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="1"  uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Title under novel</PaperText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => {setNovelsRowValue('2'), onNovelRowsChange('2')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="2" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>Title on novel cover</PaperText>
                                </View>
                            </Pressable>
                            <Pressable onPress={() => {setNovelsRowValue('3'), onNovelRowsChange('3')}} android_ripple={{color: appliedTheme.colors.elevation.level1}}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Android value="3" uncheckedColor={appliedTheme.colors.onSurfaceVariant} color={appliedTheme.colors.primary}/>
                                    <PaperText style={[styles.radioButtonText, {color: appliedTheme.colors.text}]}>No title</PaperText>
                                </View>
                            </Pressable>
                            <Button onPress={closeBookLayoutModal} textColor={appliedTheme.colors.text}>Close</Button>
                        </RadioButton.Group>
                    </View>
                </ModalComponent>
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
