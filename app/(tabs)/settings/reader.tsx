import React from 'react';
import { View, StyleSheet} from 'react-native';
import ReaderSetting from '@/components/settings/ReaderSetting';
import { useThemeContext } from '@/contexts/ThemeContext';
const Reader = () => {
    const { appliedTheme } = useThemeContext();
    const clearReaderOptions = () => {
      return;
    }
    return (
        <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2}]}>
            <ReaderSetting onOptionsChange={clearReaderOptions}/>
        </View>
    )
}

export default Reader;

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