import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface AxiosErrorHandlerProps {
    sourceName: string;
    sourceURL: string;
}

const AxiosErrorHandler: React.FC<AxiosErrorHandlerProps> = ({ sourceName, sourceURL }) => {
    const { appliedTheme } = useThemeContext()
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    const openWebView = () => setModalVisible(true);
    const closeWebView = () => {
        setModalVisible(false)
        router.navigate({pathname: '/(tabs)/sources'});
    };

    return (
        <View style={[styles.container, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
            <Text style={[styles.errorText, {color: appliedTheme.colors.text}]}>
                There are problems accessing the source's content, please open it in webview and try again.
            </Text>
            <Pressable onPress={openWebView} style={[styles.button, { backgroundColor: appliedTheme.colors.primary }]}>
                <Text style={styles.buttonText}>OPEN {sourceName.toUpperCase()}</Text>
            </Pressable>
            <Modal visible={modalVisible} onRequestClose={closeWebView}>
                <View style={{ flex: 1 }}>
                    <WebView source={{ uri: sourceURL }} />
                    <Button title="Close" onPress={closeWebView} />
                </View>
            </Modal>
        </View>
    );
};

export default AxiosErrorHandler;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007aff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});