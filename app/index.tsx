import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CoreProviders>
        <AppContent />
      </CoreProviders>
    </GestureHandlerRootView>
  );
}

function CoreProviders({ children }: { children: ReactNode }) {
  const { appliedTheme } = useThemeContext();
  return (
    <PaperProvider theme={appliedTheme}>
      <SafeAreaProvider>
        {/* <StatusBar
          // barStyle={ theme.startsWith('light') ? 'light-content' : 'dark-content'}
          backgroundColor={appliedTheme.colors.background}
        /> */}
        {children}
      </SafeAreaProvider>
    </PaperProvider>
  );
}

function AppContent() {
  // const { theme, appliedTheme } = useThemeContext();
  return (
    <View style={styles.container}>
      {/* <StatusBar
          barStyle={ theme.startsWith('light') ? 'light-content' : 'dark-content'}
          backgroundColor={appliedTheme.colors.background}
        /> */}
      <Redirect href="/(tabs)/library" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
