import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { NovelRowsProvider } from '@/contexts/NovelRowsContext';
import Footer from '@/components/Footer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <ThemeProvider>
      <NovelRowsProvider>
      <AppContent />
      </NovelRowsProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme, appliedTheme } = useThemeContext();
  // const barStyle = theme.startsWith('dark') ? 'light-content' : 'dark-content';
  return (
    <PaperProvider theme={appliedTheme}>
      <SafeAreaProvider>
      {/* <StatusBar backgroundColor={appliedTheme.colors.background} barStyle={barStyle}/> */}
        <View style={styles.container}>
          <Footer />
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
