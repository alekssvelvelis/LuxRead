import React from 'react';
import { View } from 'react-native';
import { Stack } from "expo-router";
import AppContextProvider from "@/contexts/AppContextProvider";
import { useThemeContext } from '@/contexts/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const StackLayout = () => {
    return(
        <AppContextProvider>
            <StackNavigator />
        </AppContextProvider>
    );
}

function StackNavigator() {
    const { appliedTheme } = useThemeContext();
    return (
        <View style={{ flexGrow: 1, backgroundColor: appliedTheme.colors.elevation.level2 }}>
            <Stack screenOptions={{
                contentStyle: { backgroundColor: appliedTheme.colors.elevation.level4}
            }}>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
        </View>
    );
}

export default StackLayout;