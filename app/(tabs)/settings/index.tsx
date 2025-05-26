import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Settings = () => {
    const { appliedTheme } = useThemeContext();
    const router = useRouter();
    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
          <Text style={[styles.header, {color: appliedTheme.colors.text}]}>Settings</Text>
          <Pressable
              onPress={() => {router.push('/settings/appearance')}}
              android_ripple={{ color: appliedTheme.colors.secondary }}
              style={styles.pressable}
          > 
            <View style={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Entypo name="round-brush" color={appliedTheme.colors.primary} size={30} />    
              <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Appearance</Text>      
              <Text style={[styles.descriptiveLabel, {color: appliedTheme.colors.text, fontSize: 14}]}>Color theme, pure black mode</Text> 
            </View>
          </Pressable>
          <Pressable
              onPress={() => {router.push('/settings/display')}}
              android_ripple={{ color: appliedTheme.colors.secondary }}
              style={styles.pressable}
          > 
            <View style={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="phone-portrait-outline" color={appliedTheme.colors.primary} size={30} />    
              <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Display</Text>    
              <Text style={[styles.descriptiveLabel, {color: appliedTheme.colors.text, fontSize: 14}]}>Novel row layout, novel title layout</Text>    
            </View>
          </Pressable>
          <Pressable
              onPress={() => {router.push('/settings/reader')}}
              android_ripple={{ color: appliedTheme.colors.secondary }}
              style={styles.pressable}
          > 
            <View style={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="book-outline" color={appliedTheme.colors.primary} size={30} />    
              <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Reading</Text>
              <Text style={[styles.descriptiveLabel, {color: appliedTheme.colors.text, fontSize: 14}]}>Chapter text layout and styling</Text>    
            </View>
          </Pressable>
          <Pressable
              onPress={() => {router.push('/settings/database')}}
              android_ripple={{ color: appliedTheme.colors.secondary }}
              style={styles.pressable}
          > 
            <View style={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Entypo name="database" color={appliedTheme.colors.primary} size={30} />    
              <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Database</Text>     
              <Text style={[styles.descriptiveLabel, {color: appliedTheme.colors.text, fontSize: 14}]}>Clear database tables</Text>    
            </View>
          </Pressable>
          <Pressable
              onPress={() => {router.push('/settings/notifications')}}
              android_ripple={{ color: appliedTheme.colors.secondary }}
              style={styles.pressable}
          > 
            <View style={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Entypo name="bell" color={appliedTheme.colors.primary} size={30} />    
              <Text style={[styles.label, { color: appliedTheme.colors.text }]}>Notifications</Text>    
              <Text style={[styles.descriptiveLabel, {color: appliedTheme.colors.text, fontSize: 14}]}>Set daily reminder notifications</Text>     
            </View>
          </Pressable>
          <Pressable
              onPress={() => {router.push('/settings/about')}}
              android_ripple={{ color: appliedTheme.colors.secondary }}
              style={styles.pressable}
          > 
            <View style={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Entypo name="info" color={appliedTheme.colors.primary} size={30} />    
              <Text style={[styles.label, { color: appliedTheme.colors.text }]}>About</Text>    
              <Text style={[styles.descriptiveLabel, {color: appliedTheme.colors.text, fontSize: 14}]}>Contacts, GitHub repository, app version</Text>     
            </View>
          </Pressable>
        </ScrollView>
    );
}
export default Settings;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  infoContainer: {
    width: '95%',
  },
  pressable: {
    alignItems: 'flex-start',
    padding: 10,
    width: '100%',
  },
  currentValue: {
    fontSize: 14
  },
  label: {
    fontSize: 24,
    marginLeft: 14,
    marginBottom: 14
  },
  descriptiveLabel: {
    position: "absolute",
    top: 34,
    left: 48,
  },
  header: {
    fontSize: 32,
    marginBottom: 48,
  }
});