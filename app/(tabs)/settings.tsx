import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useNovelRowsContext } from '@/contexts/NovelRowsContext';
import ThemeSelector from '@/components/settings/ThemeSelector';
import Display from '@/components/settings/Display';
import ReaderOptions from '@/components/settings/ReaderOptions';
export default function Settings() {
    const { setTheme, appliedTheme } = useThemeContext();
    const { setValue } = useNovelRowsContext();
    const clearReaderOptions = () => {
      return;
    }
    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
            <View style={[styles.infoContainer]}>
                <Text style={{color: appliedTheme.colors.primary, marginTop: 32, marginHorizontal: 8, fontSize: 24}}>Appearance</Text>
                <ThemeSelector onThemeChange={setTheme} />
            </View>
            <View style={[styles.infoContainer]}>
                <Text style={{color: appliedTheme.colors.primary, marginTop: 32, marginHorizontal: 8, fontSize: 24}}>Display</Text>
                <Display onNovelRowsChange ={setValue}/>
            </View>
            <View style={[styles.infoContainer]}>
                <Text style={{color: appliedTheme.colors.primary, marginTop: 32, marginHorizontal: 8, fontSize: 24}}>Reader Options</Text>
                <ReaderOptions onOptionsChange={clearReaderOptions}/>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  infoContainer: {
    width: '95%',
  }
});