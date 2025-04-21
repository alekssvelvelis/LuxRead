import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { saveReaderOptions, getReaderOptions } from '@/utils/asyncStorage';

interface ReaderOptionsProps {
  onOptionsChange: (options: { fontSize: number; lineHeight: number; textAlign: string; fontFamily: string }) => void;
}

const FONT_PRESETS = ['serif', 'Roboto', 'monospace'];
const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'];

const ReaderSetting: React.FC<ReaderOptionsProps> = ({ onOptionsChange }) => {

  const SettingSlider = ({ title, value, min, max, onChange, color }: { title: string; value: number; min: number; max: number; onChange: (val: number) => void; color: any}) => (
    <View style={styles.pullupModalItemContainer}>
      <Text style={[styles.pullupModalSettingTitle, { color: color.text }]}>{title}</Text>
      <View style={styles.pullupModalItemContainerInner}>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={value}
          onSlidingComplete={onChange}
          minimumTrackTintColor={color.primary}
          maximumTrackTintColor={color.text}
          thumbTintColor={color.primary}
        />
        <Text style={{ color: color.text }}>{value}</Text>
      </View>
    </View>
  );

  const { appliedTheme } = useThemeContext();

  const [options, setOptions] = useState({
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'left',
    fontFamily: 'Roboto',
  });
  const [loading, setLoading] = useState(true);

  const updateOptions = useCallback((newOptions: Partial<typeof options>) => {
    setOptions((prev) => {
      const updated = { ...prev, ...newOptions };
      onOptionsChange(updated);
      saveReaderOptions(updated);
      return updated;
    });
  }, [onOptionsChange]);

  useEffect(() => {
    const loadReaderOptions = async () => {
      try {
        const saved = await getReaderOptions();
        if (saved) {
          updateOptions(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading reader options', error);
      } finally {
        setLoading(false);
      }
    };
    loadReaderOptions();
  }, [updateOptions]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View>
      <SettingSlider
        title="Text size"
        value={options.fontSize}
        min={12}
        max={24}
        onChange={(value) => updateOptions({ fontSize: value })}
        color={appliedTheme.colors}
      />

      <SettingSlider
        title="Line height"
        value={options.lineHeight}
        min={18}
        max={32}
        onChange={(value) => updateOptions({ lineHeight: value })}
        color={appliedTheme.colors}
      />

      <View style={styles.pullupModalItemContainer}>
        <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text align</Text>
        <View style={styles.pullupModalItemContainerInner}>
          {TEXT_ALIGN_OPTIONS.map((alignment) => (
            <TouchableOpacity key={alignment} onPress={() => updateOptions({ textAlign: alignment })}>
              <MaterialIcons
                name={`format-align-${alignment}`}
                size={28}
                color={appliedTheme.colors.text}
                style={{
                  marginHorizontal: 12,
                  backgroundColor: options.textAlign === alignment ? appliedTheme.colors.primary : 'transparent',
                  borderRadius: 4,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.pullupModalItemContainer}>
        <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Font preset</Text>
        <FlatList
          data={FONT_PRESETS}
          horizontal
          keyExtractor={(item) => item}
          renderItem={({ item: font }) => (
            <TouchableOpacity onPress={() => updateOptions({ fontFamily: font })}>
              <View style={[
                styles.fontPill,
                {
                  backgroundColor: options.fontFamily === font
                    ? appliedTheme.colors.primary
                    : appliedTheme.colors.elevation.level3,
                }
              ]}>
                <Text style={{ color: appliedTheme.colors.text }}>{font}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, alignItems: 'center' }}
        />
      </View>
    </View>
  );
};

export default ReaderSetting;

const styles = StyleSheet.create({
  pullupModalItemContainer: {
    width: '100%',
    flexDirection: 'row',
    padding: 8,
  },
  pullupModalItemContainerInner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pullupModalSettingTitle: {
    fontSize: 18,
  },
  fontPill: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    height: 32,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginTop: 400,
  },
});
