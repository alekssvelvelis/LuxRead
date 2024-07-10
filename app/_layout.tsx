// App/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false
      }}>
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="library" options={{}} />
      <Stack.Screen name="settings" options={{}} />
    </Stack>
  );
}
