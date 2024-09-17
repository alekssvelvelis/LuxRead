import { Tabs } from "expo-router";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
export default () => {
    const { theme, appliedTheme } = useThemeContext();
    // const barStyle = theme.startsWith('dark') ? 'dark-content' : 'light-content';
    const barStyle = theme.split('-')[0]+'-content';
    console.log(barStyle);
    return (
        <>
        <StatusBar backgroundColor={appliedTheme.colors.background} barStyle={'dark-content'} hidden={false}/>
        <Tabs screenOptions={{ 
            tabBarActiveTintColor: appliedTheme.colors.primary, 
            tabBarStyle: {
                height: 75,
                backgroundColor: appliedTheme.colors.elevation.level2,
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
            <Tabs.Screen name="list" options={{headerShown: false}}/>
        </Tabs>
        </>
    );
}