import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
const PureBlackToggle = () => {
    const { theme, appliedTheme, isPureBlack, setPureBlack } = useThemeContext();
    const [localPureBlack, setLocalPureBlack] = useState<boolean>(isPureBlack);

    const onToggle = async () => {
        setLocalPureBlack(!localPureBlack);
        setPureBlack(!localPureBlack);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: appliedTheme.colors.text }]}>
                Pure Black Mode
            </Text>
            <Switch
                value={localPureBlack}
                onValueChange={onToggle}
                disabled={!theme.startsWith('dark')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        width: '60%'
    },
    label: {
        fontSize: 16,
    },
});

export default PureBlackToggle;