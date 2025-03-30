import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import AboutSection from '@/components/settings/AboutSection';
const About = () => {
    const { appliedTheme } = useThemeContext();
  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2}]}>
        <AboutSection />
    </View>
  );
}
export default About;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});