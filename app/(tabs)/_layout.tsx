import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Tabs } from "expo-router";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default () => {
    const { theme, isPureBlack, appliedTheme } = useThemeContext();
    useEffect(() => {
        if (theme.startsWith('light')) {
          StatusBar.setBarStyle('dark-content', true);
          StatusBar.setBackgroundColor(appliedTheme.colors.elevation.level2, true);
        } else if (theme.startsWith('dark')) {
          StatusBar.setBarStyle('light-content', true);
          isPureBlack ? StatusBar.setBackgroundColor(appliedTheme.colors.elevation.level2, true) : StatusBar.setBackgroundColor(appliedTheme.colors.elevation.level2, true);
        }
      }, [theme, isPureBlack]);
    return (
        <Tabs screenOptions={{ 
            tabBarActiveTintColor: appliedTheme.colors.primary,
            tabBarInactiveTintColor: appliedTheme.colors.text.primary,
            tabBarStyle: {
                height: 100,
                backgroundColor: appliedTheme.colors.elevation.level4,
                borderTopWidth: 0,
            },
            tabBarLabelStyle: {
                fontSize: 12,
            },
        }}>
            <Tabs.Screen
                name="library"
                options={{
                    headerShown: false,
                    title: 'Library',
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="book" color={color} />,
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
                    popToTopOnBlur: true,
                }}
            />
        </Tabs>
    );
}