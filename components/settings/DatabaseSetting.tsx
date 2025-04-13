import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Modal, Animated, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from 'react-native-paper';
import { clearTable } from '@/database/ExpoDB';
import ModalComponent from '../ModalComponent';
const DatabaseSetting = () => {
    const screenWidth = Dimensions.get('screen').width;
    const { appliedTheme } = useThemeContext();
    const [visible, setVisible] = useState<boolean>(false);
    const [tableName, setTableName] = useState<string>('');
    const openModal = (tableNameString: string) => {
        setVisible(true);
        setTableName(tableNameString)
    };

    const closeModal = () => {
        setVisible(false);
    };

    const handleClearTable = async (tableName: string) => {
        try {
            if(tableName === 'libraryNovels'){
                await clearTable(tableName);
                await clearTable('novelChapters');
            }
            await clearTable(tableName);
        } catch (error) {
            console.error('Error clearing table', tableName, 'throws', error);
        } finally {
            setVisible(false);
        }
    }

    return (
        <View style={[styles.container, { width: screenWidth - 20, }]}>
            <Pressable
                onPress={() => openModal('libraryNovels')}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Library novels</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Clear library novels table</Text>
            </Pressable>
            <Pressable
                onPress={() => openModal('downloadedChapters')}
                android_ripple={{ color: appliedTheme.colors.secondary }}
                style={styles.pressable}
            >
                <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Downloaded chapters</Text>
                <Text style={[styles.currentValue, { color: appliedTheme.colors.text }]}>Clear downloaded chapters table</Text>
            </Pressable>
            {visible && 
            <ModalComponent visible={visible} onClose={closeModal}>
                    <View style={{width: '100%', backgroundColor: appliedTheme.colors.surfaceVariant, padding: 20, borderRadius: 8, minHeight: 240}}>
                            <Text style={{ color: appliedTheme.colors.primary, justifyContent: 'flex-start', fontSize: 24 }}>Clear {tableName}</Text>
                            <Text style={{ color: appliedTheme.colors.text, justifyContent: 'flex-start', marginVertical: 8 }}>Are you sure you want to clear <Text style={{color: appliedTheme.colors.primary}}>{tableName}</Text>?</Text>
                            <Text style={{ color: appliedTheme.colors.text, justifyContent: 'flex-start' }}>This action is irreversible</Text>
                            <View style={{flex: 1, display: 'flex', alignItems: 'center',}}>
                                <Button onPress={() => handleClearTable(tableName)} textColor={appliedTheme.colors.text} style={{backgroundColor: appliedTheme.colors.primary, width: '50%', marginTop: 8}}>Clear</Button>
                            </View>
                    </View>
                </ModalComponent>
            }
        </View>
    );
};

export default DatabaseSetting;

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
        left: '2.5%',
        width: '95%',
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
