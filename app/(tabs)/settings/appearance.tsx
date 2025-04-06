import React from 'react';
import { View, StyleSheet} from 'react-native';
import ThemeSelector from '@/components/settings/ThemeSelector';
import PureBlackToggle from '@/components/settings/PureBlackToggle';
import { useThemeContext } from '@/contexts/ThemeContext';

const Appearance = () => {
    const { appliedTheme } = useThemeContext();
    return (
        <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2}]}>
            <ThemeSelector />
            <PureBlackToggle />
        </View>
    )
}

export default Appearance;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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