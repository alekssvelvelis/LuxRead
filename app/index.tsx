import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import Footer from '@/components/Footer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { appliedTheme } = useThemeContext();

  return (
    <PaperProvider theme={appliedTheme}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: appliedTheme.colors.background }}>
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
