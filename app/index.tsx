import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContent />
    </GestureHandlerRootView>
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
