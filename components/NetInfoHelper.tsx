import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import useNavigateBack from '@/hooks/useNavigateBack';
const NetInfoHelper = ({ }) => {
    const { appliedTheme } = useThemeContext();
    const navigateBack = useNavigateBack();
    return (
        <View style={styles.container}>
            <Text style={{ color: appliedTheme.colors.text, marginVertical: 12, fontSize: 24 }}>(✖╭╮✖)</Text>
            <Text style={{ color: appliedTheme.colors.text, fontSize: 18, textAlign: 'center' }}>
                You are offline, check your internet connection
            </Text>
            {/* <Text style={{ color: appliedTheme.colors.text, marginTop: 12, fontSize: 24 }}>¯\_(ツ)_/¯</Text> */}
            <TouchableOpacity style={[styles.returnButton, {backgroundColor: appliedTheme.colors.primary}]} onPress={navigateBack}>
                <Text style={{ color: appliedTheme.colors.text, fontSize: 24 }}>Return</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '50%',
        left: '20%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        alignItems: 'center',
    },
    returnButton: {
        marginTop: 12,
        width: 100,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default NetInfoHelper;
