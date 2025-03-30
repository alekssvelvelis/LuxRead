import React from 'react';
import { View, StyleSheet} from 'react-native';
import ThemeSelector from '@/components/settings/ThemeSelector';
import { useThemeContext } from '@/contexts/ThemeContext';
const Appearance = () => {
    const { setTheme, appliedTheme } = useThemeContext();
    return (
        <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2}]}>
            <ThemeSelector onThemeChange={setTheme} />
        </View>
    )
}

export default Appearance;

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
  },
  header: {
    fontSize: 32,
    marginBottom: 48,
  }
});