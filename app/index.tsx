import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect } from "expo-router";

export default function Index() {
  return <AppContent />;
}

function AppContent() {
  const { appliedTheme } = useThemeContext();

  return (
    <PaperProvider theme={appliedTheme}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <Redirect href="/(tabs)/library" />
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
