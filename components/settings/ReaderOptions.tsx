import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { saveReaderOptions, getReaderOptions } from '@/utils/asyncStorage';

interface ReaderOptionsProps {
  onOptionsChange: (options: { fontSize: number; lineHeight: number; textAlign: string; fontFamily: string }) => void;
}

const ReaderOptions: React.FC<ReaderOptionsProps> = ({ onOptionsChange }) => {
  const { appliedTheme } = useThemeContext();

  const [fontSize, setFontSize] = useState<number | null>(null);
  const [lineHeight, setLineHeight] = useState<number | null>(null);
  const [textAlign, setTextAlign] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReaderOptions = async () => {
      try {
        const options = await getReaderOptions('readerOptions');
        if (options) {
          const { fontSize, lineHeight, textAlign, fontFamily } = JSON.parse(options);
          setFontSize(fontSize || 16);
          setLineHeight(lineHeight || 25);
          setTextAlign(textAlign || 'left');
          setFontFamily(fontFamily || 'Roboto');
        }
      } catch (error) {
        console.error('Error loading reader options', error);
      } finally {
        setLoading(false);
      }
    };

    loadReaderOptions();
  }, []);

  useEffect(() => {
    if (fontSize !== null && lineHeight !== null && textAlign !== null && fontFamily !== null) {
      onOptionsChange({ fontSize, lineHeight, textAlign, fontFamily });
      saveReaderOptions({ fontSize, lineHeight, textAlign, fontFamily });
    }
  }, [fontSize, lineHeight, textAlign, fontFamily]);

  const handleFontSizeChange = (value: number) => setFontSize(value);
  const handleLineHeightChange = (value: number) => setLineHeight(value);
  const handleTextAlignChange = (alignment: string) => setTextAlign(alignment);
  const handleFontFamilyChange = (font: string) => setFontFamily(font);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appliedTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.pullupModalItemContainer}>
        <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text size</Text>
        <View style={styles.pullupModalItemContainerInner}>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={12}
            maximumValue={24}
            step={1}
            value={fontSize ?? 16} // Fallback for initial render
            onValueChange={handleFontSizeChange}
            minimumTrackTintColor={appliedTheme.colors.primary}
            maximumTrackTintColor={appliedTheme.colors.text}
            thumbTintColor={appliedTheme.colors.primary} 
          />
          <Text style={{ color: appliedTheme.colors.text }}>{fontSize}</Text>
        </View>
      </View>
      <View style={styles.pullupModalItemContainer}>
        <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Line height</Text>
        <View style={styles.pullupModalItemContainerInner}>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={18}
            maximumValue={32}
            step={1}
            value={lineHeight ?? 25} // Fallback for initial render
            onValueChange={handleLineHeightChange}
            minimumTrackTintColor={appliedTheme.colors.primary}
            maximumTrackTintColor={appliedTheme.colors.text}
            thumbTintColor={appliedTheme.colors.primary} 
          />
          <Text style={{ color: appliedTheme.colors.text }}>{lineHeight}</Text>
        </View>
      </View>
      <View style={styles.pullupModalItemContainer}>
        <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text align</Text>
        <View style={styles.pullupModalItemContainerInner}>
          {['left', 'center', 'right', 'justify'].map((alignment) => (
            <TouchableOpacity key={alignment} onPress={() => handleTextAlignChange(alignment)}>
              <MaterialIcons
                size={28}
                name={`format-align-${alignment}`}
                color={appliedTheme.colors.text}
                style={{
                  marginHorizontal: 12,
                  backgroundColor: textAlign === alignment ? appliedTheme.colors.primary : 'transparent',
                  borderRadius: 4,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.pullupModalItemContainer}>
        <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Font preset</Text>
        <View style={styles.pullupModalItemContainerInner}>
          <FlatList
            data={['serif', 'Roboto', 'monospace']}
            horizontal
            style={{ marginLeft: 8 }}
            keyExtractor={(item) => item}
            renderItem={({ item: font }) => (
              <TouchableOpacity onPress={() => handleFontFamilyChange(font)}>
                <View style={[styles.fontPill, { backgroundColor: fontFamily === font ? appliedTheme.colors.primary : appliedTheme.colors.elevation.level3 }]}>
                  <Text style={{ color: appliedTheme.colors.text }}>{font}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
          />
        </View>
      </View>
    </View>
  );
}

export default ReaderOptions;

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
