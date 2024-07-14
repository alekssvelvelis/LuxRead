import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Settings from '@/app/settings';
import Library from '@/app/library';

import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';

const Tab = createMaterialBottomTabNavigator();
export default function Footer() {
  
  return (
    <Tab.Navigator shifting={true}>
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}  
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => {
            return <Ionicons name="book" size={26} color={color} />;
          },
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
  
          tabBarIcon: ({ color }) => {
            return <Ionicons name="cog" size={26} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}

function LibraryScreen() {
  return (
    <Library/>
  );
}

function SettingsScreen() {
  return (
      <Settings/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});