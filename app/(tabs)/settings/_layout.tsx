import React from 'react';
import { Stack } from 'expo-router';
import { useThemeContext } from "@/contexts/ThemeContext";

export default function SettingsLayout() {
    const { appliedTheme } = useThemeContext();
    
    return (
        <Stack screenOptions={{
            contentStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
            headerStyle: { backgroundColor: appliedTheme.colors.elevation.level2 },
            headerTintColor: appliedTheme.colors.text,
            headerShadowVisible: false,
            headerLargeTitle: true
        }}>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
            <Stack.Screen name="display" options={{ title: "Display" }} />
            <Stack.Screen name="reader" options={{ title: "Reader" }} />
            <Stack.Screen name="database" options={{ title: "Database" }} />
            <Stack.Screen name="about" options={{ title: "About" }} />
        </Stack>
    );
}