import React from 'react';
import { Stack } from "expo-router";
import AppContextProvider from "@/contexts/AppContextProvider";
import { useThemeContext } from '@/contexts/ThemeContext';

const StackLayout = () => {
    return(
        <AppContextProvider>
            <StackNavigator />
        </AppContextProvider>
    );
}

// Separated to access theme context
function StackNavigator() {
    const { appliedTheme } = useThemeContext();
    return (
        <Stack screenOptions={{
            contentStyle: { backgroundColor: appliedTheme.colors.elevation.level2 }
        }}>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        </Stack>
    );
}

export default StackLayout;