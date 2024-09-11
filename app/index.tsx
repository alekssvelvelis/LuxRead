import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect } from "expo-router";

export default function Index() {
  return (
      <AppContent />
  );
}

function AppContent() {
  const { theme, appliedTheme } = useThemeContext();
  const barStyle = theme.startsWith('dark') ? 'light-content' : 'dark-content';
  return (
    <PaperProvider theme={appliedTheme}>
      <SafeAreaProvider>
      <StatusBar backgroundColor={appliedTheme.colors.background} barStyle={barStyle}/>
        <View style={styles.container}>
          <Redirect href="/(tabs)/library"/>
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