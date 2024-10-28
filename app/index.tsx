import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FirstLaunchSetup from '@/components/FirstTimeSetup';
export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CoreProviders>
        <FirstLaunchSetup >
          <AppContent />
        </FirstLaunchSetup>
      </CoreProviders>
    </GestureHandlerRootView>
  );
}

function CoreProviders({ children }: { children: ReactNode }) {
  const { appliedTheme } = useThemeContext();
  return (
    <PaperProvider theme={appliedTheme}>
      <SafeAreaProvider>
        {children}
      </SafeAreaProvider>
    </PaperProvider>
  );
}

function AppContent() {
  return (
    <View style={styles.container}>
      <Redirect href="/(tabs)/library" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
