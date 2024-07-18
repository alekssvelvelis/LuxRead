import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useNovelRowsContext } from '@/contexts/NovelRowsContext';
import ThemeSelector from '@/components/settings/ThemeSelector';
import Display from '@/components/settings/Display';
export default function Settings() {
    const { setTheme, appliedTheme } = useThemeContext();
    const { setValue } = useNovelRowsContext();
    return (
        <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
            <View style={styles.infoContainer}>
                <Text style={{color: appliedTheme.colors.primary, marginTop: 32, marginHorizontal: 8, fontSize: 24}}>Appearance</Text>
                <ThemeSelector onThemeChange={setTheme} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={{color: appliedTheme.colors.primary, marginTop: 32, marginHorizontal: 8, fontSize: 24}}>Display</Text>
                <Display onNovelRowsChange ={setValue}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  infoContainer: {
    width: '95%',
    height: '60%'
  }
});