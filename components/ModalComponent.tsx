import React from 'react';
import { View, StyleSheet, Modal as RNModal, Pressable } from 'react-native';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

const ModalComponent = ({ visible, onClose, children }: ModalProps) => {
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
            <View style={[styles.modalContent]}>
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
        flex: 1,
        width: '80%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
});