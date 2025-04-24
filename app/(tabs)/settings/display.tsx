import React from 'react';
import { View, StyleSheet} from 'react-native';
import DisplaySetting from '@/components/settings/DisplaySetting';

import { useNovelRowsContext } from '@/contexts/NovelRowsContext';
import { useNovelLayoutContext } from '@/contexts/NovelLayoutContext';
import { useThemeContext } from '@/contexts/ThemeContext';
const Display = () => {
    const { appliedTheme } = useThemeContext();
    const { setValue } = useNovelRowsContext();
    const { setNovelLayoutValue } = useNovelLayoutContext();
    return (
        <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2}]}>
            <DisplaySetting 
                onNovelRowsChange={setValue} 
                onNovelLayoutChange={setNovelLayoutValue} 
            />
        </View>
    )
}

export default Display;

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