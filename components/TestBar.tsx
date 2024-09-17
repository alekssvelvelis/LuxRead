import React, { useState } from 'react';
import { Pressable, StatusBar, View, Text } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useTheme } from 'react-native-paper';

export default function TestBar() {
    const [isStatusBarVisible, setIsStatusBarVisible] = useState(false);
    const [isLightContent, setIsLightContent] = useState(true); // State to toggle bar style

    const handleButtonPress = () => {
        setIsStatusBarVisible(!isStatusBarVisible);
        setIsLightContent(!isLightContent); // Toggle the content style
        console.log('Button pressed');
    };

    const { appliedTheme } = useThemeContext();

    return (
        <View style={{ flex: 1, backgroundColor: 'plum', padding: 25 }}>
            <Pressable 
                onPress={handleButtonPress} 
                style={{
                    backgroundColor: 'lightblue',
                    padding: 10,
                    borderRadius: 5,
                    alignItems: 'center'
                }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Toggle StatusBar</Text>
            </Pressable>
            <StatusBar 
                backgroundColor={appliedTheme.colors.background} 
                barStyle={isLightContent ? 'light-content' : 'dark-content'} // Toggle bar style
                hidden={false} 
            />
        </View>
    );
}
