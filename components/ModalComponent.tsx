import React from 'react';
import { View, StyleSheet, Dimensions, Modal as RNModal, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

const ModalComponent = ({ visible, onClose, children }: ModalProps) => {
    const { appliedTheme } = useThemeContext();
    return (
    <RNModal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent={true}
    >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={[styles.overlay]} />
            </Pressable>
            <View style={[styles.modalContent, { backgroundColor: appliedTheme.colors.surfaceVariant }]}>
                {children}
            </View>
        </RNModal>
    );
}

export  default ModalComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
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
});