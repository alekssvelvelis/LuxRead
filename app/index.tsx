import React from 'react';
import 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Index() {
  return <GestureHandlerRootView style={{flex: 1}}><AppContent /></GestureHandlerRootView>;
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
