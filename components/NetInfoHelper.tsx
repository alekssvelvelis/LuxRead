import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useThemeContext } from '@/contexts/ThemeContext';

const NetInfoHelper = ({ onConnectionChange }) => {
    const { appliedTheme } = useThemeContext();
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected);

            if (onConnectionChange) {
                onConnectionChange(state.isConnected);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [onConnectionChange]);

    if (isConnected === false) {
        return (
            <View style={styles.container}>
                <Text style={{ color: appliedTheme.colors.text }}>
                    You are offline, check your internet connection
                </Text>
                <Text style={{ color: appliedTheme.colors.text, marginTop: 12, fontSize: 24 }}>¯\_(ツ)_/¯</Text>
                <Text style={{ color: appliedTheme.colors.text, marginTop: 12, fontSize: 24 }}>(✖╭╮✖)</Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '50%',
        left: '20%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        alignItems: 'center',
    },
});

export default NetInfoHelper;
