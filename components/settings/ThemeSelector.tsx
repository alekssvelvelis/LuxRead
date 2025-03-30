
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { subThemes, SubThemesType, darkTheme, lightTheme } from '@/constants/themes';

const ThemeSelector = ({ onThemeChange }: { onThemeChange: (theme: string) => void }) => {
    const { theme, appliedTheme } = useThemeContext();
    const [activeTheme, setActiveTheme] = useState<string>(theme);
    const themes: string[] = ['light-default', 'light-ruby', 'light-aquamarine', 'light-citrine', 'dark-default', 'dark-ruby', 'dark-aquamarine', 'dark-citrine'];
    const screenWidth: number = Dimensions.get('screen').width;

    const lightThemes = themes.filter(theme => theme.startsWith('light'));
    const darkThemes = themes.filter(theme => theme.startsWith('dark'));

    const handleThemeChange = (theme: string) => {
        setActiveTheme(theme);
        onThemeChange(theme);
    };

    return (
        <View style={[styles.container, { width: screenWidth - 20 }]}>
            <Text style={[styles.header, { color: appliedTheme.colors.text }]}>Light Themes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themesContainer}>
                {lightThemes.map(theme => {
                    const subThemeName = theme.split('-')[1] as keyof SubThemesType;
                    const primaryColor = subThemes[subThemeName]?.colors.primary;
                    return (
                        <View key={theme} style={styles.themeSingleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.themePreviewContainer,
                                    activeTheme === theme && styles.activeTheme,
                                    { borderColor: appliedTheme.colors.primary, backgroundColor: lightTheme.colors.onSecondary }
                                ]}
                                onPress={() => handleThemeChange(theme)}
                            >
                                <View style={{ width: '80%', backgroundColor: lightTheme.colors.surfaceVariant, height: 16, borderRadius: 50, marginTop: 4 }}></View>
                                <View style={{ width: '30%', backgroundColor: primaryColor, borderRadius: 50, height: 16, top: 8, left: 24 }}></View>
                                <View style={{ width: '50%', backgroundColor: lightTheme.colors.secondary, borderRadius: 50, height: 16, bottom: 8, right: 20 }}></View>
                                <View style={{
                                    width: '100%', backgroundColor: lightTheme.colors.surfaceVariant, position: 'absolute', bottom: 0, height: 18, display: 'flex',
                                    justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row',
                                }}>
                                    <View style={[styles.tabNavigatorExample, { backgroundColor: lightTheme.colors.onSurfaceVariant }]}></View>
                                    <View style={[styles.tabNavigatorExample, { backgroundColor: lightTheme.colors.onSurfaceVariant }]}></View>
                                    <View style={[styles.tabNavigatorExample, { backgroundColor: lightTheme.colors.onSurfaceVariant }]}></View>
                                </View>
                            </TouchableOpacity>
                            <Text style={{ color: appliedTheme.colors.text, textTransform: 'capitalize' }}>{subThemeName}</Text>
                        </View>
                    );
                })}
            </ScrollView>

            <Text style={[styles.header, { color: appliedTheme.colors.text }]}>Dark Themes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themesContainer}>
                {darkThemes.map(theme => {
                    const subThemeName = theme.split('-')[1] as keyof SubThemesType;
                    const primaryColor = subThemes[subThemeName]?.colors.primary;
                    return (
                        <View key={theme} style={styles.themeSingleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.themePreviewContainer,
                                    activeTheme === theme && styles.activeTheme,
                                    { borderColor: appliedTheme.colors.primary, backgroundColor: darkTheme.colors.onSecondary }
                                ]}
                                onPress={() => handleThemeChange(theme)}
                            >
                                <View style={{ width: '80%', backgroundColor: darkTheme.colors.surfaceVariant, height: 16, borderRadius: 50, marginTop: 4 }}></View>
                                <View style={{ width: '30%', backgroundColor: primaryColor, borderRadius: 50, height: 16, top: 8, left: 24 }}></View>
                                <View style={{ width: '50%', backgroundColor: darkTheme.colors.secondary, borderRadius: 50, height: 16, bottom: 8, right: 20 }}></View>
                                <View style={{
                                    width: '100%', backgroundColor: darkTheme.colors.surfaceVariant, position: 'absolute', bottom: 0, height: 18, display: 'flex',
                                    justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row',
                                }}>
                                    <View style={[styles.tabNavigatorExample, { backgroundColor: darkTheme.colors.onSurfaceVariant }]}></View>
                                    <View style={[styles.tabNavigatorExample, { backgroundColor: darkTheme.colors.onSurfaceVariant }]}></View>
                                    <View style={[styles.tabNavigatorExample, { backgroundColor: darkTheme.colors.onSurfaceVariant }]}></View>
                                </View>
                            </TouchableOpacity>
                            <Text style={{ color: appliedTheme.colors.text, textTransform: 'capitalize' }}>{subThemeName}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default ThemeSelector;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 16,
        paddingLeft: 8,
        marginBottom: 10,
    },
    themesContainer: {
        flexDirection: 'row',
        overflow: 'scroll',
        marginBottom: 20,
    },
    themeSingleContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    themePreviewContainer: {
        minHeight: 100,
        display: 'flex',
        width: 100,
        position: 'relative',
        maxHeight: 200,
        backgroundColor: 'rgb(233, 223, 235)',
        marginHorizontal: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    activeTheme: {
        borderWidth: 2,
    },
    tabNavigatorExample: {
        width: 14,
        height: 14,
        borderRadius: 100,
    }
});
