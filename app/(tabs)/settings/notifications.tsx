import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import CountdownNotification from '@/components/settings/ScheduleNotification';
const Notifications = () => {
    const { appliedTheme } = useThemeContext();
  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2}]}>
        <CountdownNotification />
    </View>
  );
}
export default Notifications;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});