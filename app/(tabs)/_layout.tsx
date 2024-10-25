import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Tabs } from "expo-router";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
export default () => {
    const { theme, appliedTheme } = useThemeContext();
    useEffect(() => {
        if (theme.startsWith('light')) {
          StatusBar.setBarStyle('dark-content', true); // Light theme: dark-content for status bar
        } else if (theme.startsWith('dark')) {
          StatusBar.setBarStyle('light-content', true); // Dark theme: light-content for status bar
        }
      }, [theme]);
    return (
        <Tabs screenOptions={{ 
            tabBarActiveTintColor: appliedTheme.colors.primary, 
            tabBarStyle: {
                height: 75,
                backgroundColor: appliedTheme.colors.elevation.level3,
                borderTopWidth: 0,
            },
            tabBarLabelStyle: {
                marginBottom: 12,
                fontSize: 12,
            },
        }}>
            <Tabs.Screen
                name="library"
                options={{
                    headerShown: false,
                    title: 'Library',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="book" color={color} />,
                    tabBarStyle: {
                        height: 75,
                        backgroundColor: appliedTheme.colors.elevation.level3,
                        borderTopWidth: 0,
                    }
                }}
            />
            <Tabs.Screen
                name="sources"
                options={{
                    headerShown: false,
                    title: 'Sources',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="compass" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    headerShown: false,
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen name="list" options={{ 
                href: null,
            }}
            />
        </Tabs>
    );
}